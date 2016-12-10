document.getElementById('calibrate').addEventListener('click', function(e) {
	chrome.runtime.sendMessage({
		action: "calibrate"
	});
	window.close();
});