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