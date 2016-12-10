// Setup Background Port to listen for and pass on messages between frames (because Twitch video is in an iframe)
var tabs = {};
chrome.runtime.onConnect.addListener(function(port) {
	console.assert(port.name == 'destiny-twitch');
	port.onMessage.addListener(function(request) {
		parseAction(request, port);
	});
	port.onDisconnect.addListener(function() {
		var tabId = port.sender.tab.id;
		var frameId = port.sender.frameId;

		console.log('Disconnected Frame[Tab #'+tabId+'] | Frame #'+frameId);

		if (tabs[tabId] == undefined) return;

		var tab = tabs[tabId];
		if (tab.frontend && tab.frontend.sender.frameId == frameId) tab.frontend = null;
		else tab.backend = null;
		if (!tab.frontend && !tab.backend) delete tabs[tabId];
	});
});

var actionQueue = {};
var actionQueueInterval = false;

function parseAction(request, port) {
	var tabId = port.sender.tab.id;
	if (tabs[tabId] == undefined) tabs[tabId] = {
		id: tabId,
		frontend: null,
		backend: null
	};
	var tab = tabs[tabId];

	if (request.action == 'connect') {
		if (request.type == 'frontend') tab.frontend = port;
		else tab.backend = port;
		if (tab.frontend && tab.backend) {
			console.log('Linked Frames[Tab #'+tab.id+'] | FrontFrame #'+tab.frontend.sender.frameId+' / BackFrame #'+tab.backend.sender.frameId);
		}
		return;
	}

	if (!tab.frontend || !tab.backend) {
		if (actionQueue[request.action] == undefined) console.log('Frames Not Ready', request);
		actionQueue[request.action] = {
			request: request,
			port: port
		};
		if (!actionQueueInterval) {
			actionQueueInterval = setInterval(function() {
				if (tab.frontend && tab.backend) {
					for (var key in actionQueue) {
						var request = actionQueue[key].request;
						var port = actionQueue[key].port;
						console.log('Re-attempting', request);
						parseAction(request, port);
					}
					actionQueue = {};
					clearInterval(actionQueueInterval);
					actionQueueInterval = false;
				}
			}, 500);
		}
		return;
	}
	switch(request.action) {
		case 'update':
		case 'testActivity':
		case 'setAccount':
		case 'updateCalibrate':
			tab.frontend.postMessage(request);
			break;
		case 'setBounds':
		case 'setActivity':
		case 'setActivityMode':
		case 'toggleCalibrate':
			tab.backend.postMessage(request);
			break;
		default:
			console.log('BackgroundPort['+request.action+']', request, port);
			break;
	}
}