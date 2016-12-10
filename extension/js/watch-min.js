// @codekit-append "analyze.js"

var captureStarted = false;

setInterval(function () {
	var source = false;
	var width = 0;
	var height = 0;

	var activityData = '';
	var activity = -1;
	var position = 0;

	var capture;

	if (capture = document.getElementById('capture-video')) {
		source = capture;
		width = source.videoWidth;
		height = source.videoHeight;
		activityData = source.getAttribute('data-activity');
		position = capture.currentTime;
		//console.log('CaptureVideo', width+'x'+height, capture.currentTime);
	}
	else if (capture = document.getElementById('capture-image')) {
		source = capture;
		width = capture.naturalWidth;
		height = capture.naturalHeight;
		activityData = source.getAttribute('data-activity');
		//console.log('CaptureImage', width+'x'+height);
	}
	else {
		var videos = document.getElementsByTagName('video');
		if (videos.length > 0) {
			source = videos[0];
			width = source.videoWidth;
			height = source.videoHeight;
			//console.log('CaptureStream', width+'x'+height);
		} else {
			console.log('No CaptureStream');
		}
	}

	if (activityData) {
		//console.log('ActivityData', activityData);
		activityData = activityData.split(',');
		for (var i=0; i<activityData.length; i++) {
			var activityDataEntry = activityData[i].split(':');
			if (activityDataEntry.length == 1) activityDataEntry = [0, activityDataEntry[0]];
			var keyframe = parseInt(activityDataEntry[0]);
			var keyframeActivity = activityDataEntry[1];
			if (keyframe > position) break;
			activity = keyframeActivity;
		}
	}

	if (!source || width == 0 || height == 0) return;

	var aspectRatio = width/height;
	//width = 320;
	//height = Math.round(width / aspectRatio);

	if (!captureStarted) console.log('Input: '+width+'x'+height+' | Ratio: '+aspectRatio);
	captureStarted = true;

	//if (typeof updateCapture !== 'undefined') {
		updateCapture(source, width, height, activity);
	//}
	/*else {
		if (!captureCanvas) {
			captureCanvas = document.createElement('canvas');
		}
		captureCanvas.width = width;
		captureCanvas.height = height;
		var ctx = captureCanvas.getContext('2d');
		ctx.drawImage(source, 0, 0, width, height);

		var captureImage = captureCanvas.toDataURL("image/png");

		var port = chrome.runtime.connect({name: "captures"});
		port.postMessage({
			action: 'capture',
			image: captureImage,
			width: width,
			height: height,
			activity: activity,
			url: window.location.href
		});
	}*/
}, 500);

var compareId = 0;
var testsComplete = 0;

var captureCanvas = false, captureContext = false, calibrateCanvas = false;
var hsize = 0, vsize = 0;
var currentActivity = 0;
var oldActivity = null;

var calibrate = false;

// Setup Backend Port
var backPort = chrome.runtime.connect({name: 'destiny-twitch'});
backPort.postMessage({
	action: 'connect',
	type: 'backend'
});
backPort.onMessage.addListener(function(request) {
	switch(request.action) {
		case 'setBounds':
			hsize = request.hsize;
			vsize = request.vsize;
			break;
		case 'setActivity':
			console.log('BackEnd-SetActivity', request.activity);
			currentActivity = request.activity;
			break;
		case 'setActivityMode':
			console.log('BackEnd-SetActivityMode', request.mode);
			statuses.mode.value = request.mode;
			break;
		case 'toggleCalibrate':
			calibrate = request.value;
			break;
		default:
			console.log('BackEnd', request);
			break;
	}
});

var sameFrame = typeof appScope !== 'undefined';

// If source is in the same frame, skip sending stuff through the port (for testing)
function sendAction(action, data) {
	if (data == undefined) data = {};
	if (typeof data !== 'object') data = {value: data};
	data.action = action;
	data.url = window.location.href;
	if (sameFrame) {
		appScope.$broadcast('action', data);
	} else {
		backPort.postMessage(data);
	}
}

function testComplete() {
	testsComplete++;
	statuses.inGame.value = currentActivity != 0;
	if (testsComplete == tests.length) {
		var testOutput = [];
		for (var i=0; i<tests.length; i++) {
			var test = tests[i];
			if (!test.output || !test.diffImage) continue;
			testOutput.push({
				image: test.image,
				compToImage: test.compToImage,
				diffImage: test.diffImage,
				diffData: test.diffData,
				status: test.status
			});
		}
		var statusOutput = {};
		for (var statusId in statuses) {
			var status = statuses[statusId];
			if (status.value == null) continue;
			statusOutput[status.id] = status;
		}
		sendAction('update', {
			tests: testOutput,
			statuses: statusOutput
		});
	}
}

var sliceCanvas = document.createElement('canvas');
var sliceContext = sliceCanvas.getContext('2d');

function drawSlice(options) {
	var width = captureCanvas.width;
	var height = captureCanvas.height;

	sliceCanvas.width = options.width;
	sliceCanvas.height = options.height;

	var offsetX = options.x + (options.offset ? hsize : 0);
	if (options.originRight) offsetX = 1280 - offsetX - options.width;
	var offsetY = options.y + (options.offset ? vsize : 0);
	if (options.originBottom) offsetY = 720 - offsetY - options.height;
	var sliceX = Math.round(offsetX / 1280 * width);
	var sliceY = Math.round(offsetY / 720 * height);
	var sliceWidth = Math.round(options.width / 1280 * width);
	var sliceHeight = Math.round(options.height / 720 * height);

	//console.log('Slice', options, sliceX+','+sliceY, sliceWidth+'x'+sliceHeight);

	sliceContext.drawImage(captureCanvas, sliceX, sliceY, sliceWidth, sliceHeight, 0, 0, options.width, options.height);
}

function updateCapture(source, width, height, activity) {
	//console.log('UpdateCapture', width+'x'+height, activity);
	testsComplete = 0;

	// Simulating Live CurrentActivtyHash behaviour (for Debugging)
	if (oldActivity != activity || (activity != -1 && currentActivity != activity)) {
		oldActivity = activity;
		sendAction('testActivity', {
			activity: activity
		});
		if (activity != -1 && currentActivity != activity) {
			currentActivity = activity;
		}

	}

	if (!captureCanvas) captureCanvas = document.getElementById('capture-canvas');
	if (!captureCanvas) return;
	if (!captureContext) captureContext = captureCanvas.getContext('2d');
	if (captureCanvas.width != width || captureCanvas.height != height) {
		captureCanvas.width = width;
		captureCanvas.height = height;
	}
	captureContext.drawImage(source, 0, 0);

	if (calibrate) {
		drawSlice({
			x: 0,
			y: 0,
			width: 316,
			height: 64,
			offset: true,
			originRight: true
		});

		sendAction('updateCalibrate', sliceCanvas.toDataURL("image/png"));
		return;
	}

	for (var i=0; i<tests.length; i++) {
		var test = tests[i];

		runTest(test, source, width, height);
	}
}

function runTest(test, source, width, height) {
	var testId = compareId++;
	var thisUpdate = new Date().getTime();

	var lastUpdate = test.lastUpdate ? test.lastUpdate : 0;

	var updateDiff = thisUpdate - lastUpdate;

	var skip = false;
	if (updateDiff < test.frequency || !test.imageData) {
		skip = true;
	}
	else {
		for (var j=0; j<test.conditions.length; j++) {
			var cond = test.conditions[j];
			var status = statuses[cond.key];
			if (!status || cond.value != status.value) {
				skip = true;
				break;
			}
			//console.log('Condition', cond, status);
		}
	}
	if (skip) {
		testComplete();
		return;
	}

	test.lastUpdate = thisUpdate;

	/*var canvas = document.createElement('canvas');
	var offsetX = test.x + (test.offset ? hsize : 0);
	if (test.originRight) offsetX = 1280 - offsetX;
	var offsetY = test.y + (test.offset ? vsize : 0);
	if (test.originBottom) offsetY = 720 - offsetY;
	var sliceX = offsetX / 1280 * width;
	var sliceY = offsetY / 720 * height;
	var sliceWidth = test.width / 1280 * width;
	var sliceHeight = test.height / 720 * height;

	//var imgData = captureContext.getImageData(sliceX, sliceY, sliceWidth, sliceHeight);

	//console.log('Test', test, sliceX+','+sliceY, sliceWidth+'x'+sliceHeight);
	canvas.width = test.width;
	canvas.height = test.height;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(captureCanvas, sliceX, sliceY, sliceWidth, sliceHeight, 0, 0, test.width, test.height);*/
	drawSlice(test);
	/*if (test.mask) {
		//console.log(imgData, test.imageData);
		for (var j=3; j<imgData.data.length; j+=4) {
			//console.log(imgData[j], test.imageData[j]);
			var alpha = test.imageData.data[j]; if (alpha <= 50) alpha = 0;
			//if (alpha == 0) {
			//	imgData.data[j-3] = test.imageData.data[j-3];
			//	imgData.data[j-2] = test.imageData.data[j-2];
			//	imgData.data[j-1] = test.imageData.data[j-1];
			//}
			imgData.data[j] = alpha;
		}
	}
	ctx.putImageData(imgData, 0, 0);*/
	var imgData = sliceContext.getImageData(0, 0, test.width, test.height);

	if (test.text) {
		var options = {};
		if (test.numeric) options.numeric = true;

		sliceContext.globalCompositeOperation = 'difference';
		sliceContext.fillStyle = 'white';
		sliceContext.fillRect(0, 0, test.width, test.height);

		test.compToImage = sliceCanvas.toDataURL("image/png");

		// http://antimatter15.com/ocrad.js/demo.html

		/*OCRAD(ctx2, options, function(text) {
		 console.log('Text:'+text);
		 });*/
		//test.status.value = string;
	} else {
		//var sliceImageData = ctx2.getImageData(0, 0, canvas.width, canvas.height);
		test.compToImage = sliceCanvas.toDataURL("image/png");

		//var resembleControl = resemble(test.imageData).compareTo(dataURLtoBlob(test.compToImage));
		var resembleControl = resemble(test.imageData).compareTo(imgData);
		if (test.ignoreLess) resembleControl.ignoreLess();
		if (test.ignoreColors) resembleControl.ignoreColors();
		if (test.ignoreAntialiasing) resembleControl.ignoreAntialiasing();
		resembleControl.scaleToSameSize();
		resembleControl.onComplete(function (data) {
			test.diffImage = data.getImageDataUrl();
			test.diffData = data;
			if (test.status.isFlag) {
				test.status.value = data.rawMisMatchPercentage < test.minimum;
				test.status.diff = data.rawMisMatchPercentage;
			}
			else if (data.rawMisMatchPercentage < test.minimum && (data.rawMisMatchPercentage < test.status.diff || test.status.value == test.value)) {
				//console.log('Changed State', test.id, test.status);
				test.status.value = test.value;
				test.status.diff = data.rawMisMatchPercentage;
			}
			testComplete();
		});
	}
}

// Setup Tests
var tests = [];
var statuses = {
	inGame: {id: 'inGame', value: false, isFlag: true},
	mode: {id: 'mode', value: false}
};

var captureSize = 17;
var testMap = [
	{id: 'inMenu', x: 0, y: 0, width: 10, height: 150, image: 'test/test_menu.png', minimun: 10, offset: false, ignoreColors: true, ignoreLess: true, output: false},
	{id: 'isDead', x: -4, y: 23, width: 85, height: 64, image: 'test/test_dead.png', minimum: 40, ignoreColors: true, output: true, conditions: [
		{key: 'inGame', value: true}
	]},

	// Control
	{id: 'captureA', x: 30, y: 168, width: captureSize, height: captureSize, minimum: 70, states: [
		{value: 1, image: 'test/test_capture_a_blue.png'},
		{value: 0, image: 'test/test_capture_a_none.png'},
		{value: -1, image: 'test/test_capture_a_red.png'}
	], conditions: [
		{key: 'inGame', value: true},
		{key: 'mode', value: 'control'},
		{key: 'inMenu', value: false}
	], ignoreLess: true},
	{id: 'captureB', x: 74, y: 170, width: captureSize, height: captureSize, minimum: 70, states: [
		{value: 1, image: 'test/test_capture_b_blue.png'},
		{value: 0, image: 'test/test_capture_b_none.png'},
		{value: -1, image: 'test/test_capture_b_red.png'}
	], conditions: [
		{key: 'inGame', value: true},
		{key: 'mode', value: 'control'},
		{key: 'inMenu', value: false}
	], ignoreLess: true},
	{id: 'captureC', x: 118, y: 172, width: captureSize, height: captureSize, minimum: 70, states: [
		{value: 1, image: 'test/test_capture_c_blue.png'},
		{value: 0, image: 'test/test_capture_c_none.png'},
		{value: -1, image: 'test/test_capture_c_red.png'}
	], conditions: [
		{key: 'inGame', value: true},
		{key: 'mode', value: 'control'},
		{key: 'inMenu', value: false}
	], ignoreLess: true},

	// Cosmodrome
	/*{id: 'location', x: -10, y: 215, width: 441, height: 42, originBottom: true, minimum: 5, ignoreLess: true, ignoreAntialiasing: true, output: true, mask: true, states: [
		{value: 'mothyards', image: 'test/test_location_mothyards.png'},
		{value: 'lunar-complex', image: 'test/test_location_lunar_complex.png'},
		{value: 'skywatch', image: 'test/test_location_skywatch.png'},
		{value: 'terrestrial-complex', image: 'test/test_location_terrestrial_complex.png'},
		{value: 'cosmodrome', image: 'test/test_location_cosmodrome.png'}
	 ], conditions: [
	 	{key: 'inGame', value: true}
	 ]},*/

	// Crucible
	{id: 'teamScoreTop', x: 100, y: 68, width: 84, height: 25, frequency: 5000, originRight: true, originBottom: true, text: true, numeric: true, output: true, conditions: [
		{key: 'inGame', value: true},
		{key: 'inMenu', value: false},
		{key: 'isDead', value: false}
	]},
	{id: 'teamScoreBottom', x: 100, y: 68-25, width: 84, height: 25, frequency: 5000, originRight: true, originBottom: true, text: true, numeric: true, output: true, conditions: [
		{key: 'inGame', value: true},
		{key: 'inMenu', value: false},
		{key: 'isDead', value: false}
	]}
];
for (var i=0; i<testMap.length; i++) {
	var test = testMap[i];
	var states = test.states ? test.states : [{value: true, image: test.image}];
	var testStatus = {id: test.id, value: null, diff: 100, isFlag: states.length == 1};
	statuses[test.id] = testStatus;
	delete test.states;

	for (var j=0; j<states.length; j++) {
		var state = states[j];
		//angular.forEach(states, function(state, index) {
		//for (var j=0; j<states.length; j++) {
		//	var state = states[j];
		var stateTest = JSON.parse(JSON.stringify(test));
		//angular.copy(test, stateTest);
		if (!test.minimum) stateTest.minimum = 30;
		if (state.image) stateTest.image = state.image;
		stateTest.value = state.value;
		if (test.output) stateTest.output = test.output;
		if (!test.frequency) stateTest.frequency = 500;
		if (!test.conditions) stateTest.conditions = [];
		if (test.offset == undefined) stateTest.offset = true;
		stateTest.status = testStatus;

		stateTest.compToImage = false;
		stateTest.diffImage = false;
		stateTest.diffData = false;

		if (stateTest.image) {
			(function(stateTest) {
				var imageUrl = stateTest.image;
				var testUrl = chrome.extension.getURL(stateTest.image);

				var xhr = new XMLHttpRequest();
				xhr.open('GET', testUrl, true);
				xhr.responseType = 'blob';
				xhr.onload = function (e) {
					if (this.status == 200) {
						//stateTest.image = URL.createObjectURL(this.response);
						var blobUrl = URL.createObjectURL(this.response);
						stateTest.blob = this.response;
						//console.log(test.blob);

						var img = new Image();
						img.onload = function () {
							//console.log('Loaded Image: '+imageUrl);
							var canvas = document.createElement('canvas');
							canvas.width = img.naturalWidth;
							canvas.height = img.naturalHeight;
							var ctx = canvas.getContext('2d');
							ctx.drawImage(img, 0, 0);
							stateTest.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
							stateTest.image = canvas.toDataURL('image/png');
						};
						img.src = blobUrl;
					}
				};
				xhr.send();
			})(stateTest);
		}

		tests.push(stateTest);
		//});
	}
}

if (!(captureCanvas = document.getElementById('capture-canvas'))) captureCanvas = document.createElement('canvas');

