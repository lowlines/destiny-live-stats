document.forms[0].onsubmit = function(e) {
	e.preventDefault();
	var hsize = document.getElementById('hsize').value;
	var vsize = document.getElementById('vsize').value;
	chrome.runtime.getBackgroundPage(function(bgWindow) {
		bgWindow.setBounds(hsize, vsize);
		window.close();
	})
};