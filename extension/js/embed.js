// @codekit-prepend "bungienetapi.js"
// @codekit-prepend "destinytwitch.js"

function dataURLtoBlob(dataurl) {
	var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
	while(n--){
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], {type:mime});
}

//var profileId = localStorage.getItem('myID_cookie');
//console.log('ProfileId', profileId);

// Setup HTML Insert
var html = '<div ng-include="\''+chrome.runtime.getURL('/views/embed.html')+'\' | extension"></div>';
html = '<div id="destiny-twitch-app" class="stats" ng-controller="EmbedCtrl">'+html+'</div>';

var $insertTarget = angular.element(document.body);

// Detect Bungie.net Twitch UI
var $streamSidebar = angular.element(document.getElementsByClassName('stream-chat-gear-container'));
if ($streamSidebar.length > 0) {
	var $streamSwitcher = angular.element($streamSidebar.children()[0]);

	$streamSwitcher.append('<div class="switch-button" data-mode="stats">Live Stats</div>');
	$streamStatsBtn = angular.element($streamSwitcher.children()[2]);
	$streamStatsBtn.on('click', function (e) {
		$streamSidebar.attr('data-mode', 'stats');
		$streamSwitcher.children().removeClass('on');
		$streamStatsBtn.addClass('on');
	});
	$insertTarget = $streamSidebar;
}

//document.body.insertAdjacentHTML('beforeend', html);
$insertTarget.append(html);
angular.bootstrap(document.getElementById('destiny-twitch-app'), ['destinyTwitchApp']);

var appScope = angular.element(document.getElementById('destiny-twitch-app')).scope();

// Grab the DestinyMembership Info of the current stream
var $currentProfile = angular.element(document.getElementsByClassName('community-description'));
if ($currentProfile.length > 0) {
	var streamProfileUrl = $currentProfile.html().replace(/[\n\t]+/g, '').replace(/^.*href="([^"]+)".*/, '$1');
	//console.log($currentProfile, $currentProfile.html(), streamProfileUrl);
	var streamProfileInfo = streamProfileUrl.replace(/^.*Profile\/([^\/]+)\/([^\/\?]+).*/, '$1|$2').split('|');
	console.log('StreamProfileId', streamProfileUrl, streamProfileInfo);
	appScope.$broadcast('action', {
		action: 'setAccount',
		membershipType: streamProfileInfo[0],
		membershipId: streamProfileInfo[1],
		url: window.location.href
	});
}