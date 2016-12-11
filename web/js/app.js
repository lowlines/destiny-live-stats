var testApp = angular.module('testApp', []);
testApp.controller('MainCtrl', function($scope) {
	console.log('MainCtrl');

	$scope.images = [
		{src: 'archive/screen_menu.jpg', name: 'In Orbit (In Menu)', activityData: '0'},
		{src: 'archive/screen_dead.jpg', name: 'Control: Exodus Blue (Dead)', activityData: '4287936726;control'},
		{src: 'archive/screen_team_score.png', name: 'Control: Exodus Blue', activityData: '4287936726;control'},
		{src: 'archive/Destiny_Burning_Shrine_Location.jpg', name: 'Clash: The Burning Shrine (Start)', activityData: '284635225;clash'},

		{src: 'archive/Destiny_20161207120642.jpg', name: 'Patrol: Cosmodrome (The Steppes)', activityData: '167419252;patrol'},
		{src: 'archive/Destiny_20161207120658.jpg', name: 'Patrol: Cosmodrome (Dock 13)', activityData: '167419252;patrol'},
		{src: 'archive/Destiny_20161207120808.jpg', name: 'Patrol: Cosmodrome (The Breach)', activityData: '167419252;patrol'},
		{src: 'archive/Destiny_20161207120823.jpg', name: 'Patrol: Cosmodrome (The Divide)', activityData: '167419252;patrol'},
		{src: 'archive/Destiny_20161207121006.jpg', name: 'Patrol: Cosmodrome (Cosmodrome)', activityData: '167419252;patrol'},

		{src: 'archive/Destiny_20161207121006.jpg', name: 'Rift: Anomaly (Spark Charging)', activityData: '2082069870;rift'},
		{src: 'archive/Destiny_20161207121557.jpg', name: 'Rift: Anomaly (Spark Available)', activityData: '2082069870;rift'},
		{src: 'archive/Destiny_20161207122220.jpg', name: 'Rumble: Bannerfall (Nav Mode)', activityData: '3602734434;rumble'},
		{src: 'archive/Destiny_20161207122432.jpg', name: 'Salvage: Bastion (Relic Available)', activityData: '4200263342;salvage'},
		{src: 'archive/Destiny_20161207122510.jpg', name: 'Salvage: Bastion (Relic Defending)', activityData: '4200263342;salvage'},

		{src: 'archive/Destiny_20161207124618.jpg', name: 'Social: Tower (Tower Hangar)', activityData: '2151413729;social'},
		{src: 'archive/Destiny_20161207124801.jpg', name: 'Social: Tower (Tower Plaza)', activityData: '2151413729;social'},
		{src: 'archive/Destiny_20161207124812.jpg', name: 'Social: Tower (Tower North)', activityData: '2151413729;social'},
		{src: 'archive/Destiny_20161210194953.jpg', name: 'Patrol: The Plaguelands (Dead)', activityData: '355605844;patrol'},

		{src: 'archive/Destiny_20161210201634.jpg', name: 'In Orbit (In Menu) 1080p', activityData: '0'},
		{src: 'archive/Destiny_20161210201657.jpg', name: 'In Orbit (Inspecting Item) 1080p', activityData: '0'}
	];
	$scope.videos = [
		{src: 'archive/Destiny_20161005143909.mp4', name: 'Iron Banner Supremacy: Thieves\' Den / Bannerfall', activityData: '637046772;supremacy,260:0,380:3602734434;supremacy'},
		{src: 'archive/Destiny_20161012155247.mp4', name: 'Control: Exodus Blue / Firebase Delphi', activityData: '4287936726;control,504:0,570:3101475152;control'},
		{src: 'archive/Destiny_20161206182100.mp4', name: 'Patrol: Cosmodrome (Map Loop)', activityData: '167419252;patrol'},
		{src: 'archive/Destiny_20161206182339.mp4', name: 'Patrol: Cosmodrome (Breach > Cosmodrome)', activityData: '167419252;patrol'},
		{src: 'archive/Destiny_20161206182622.mp4', name: 'Elimination: The Burning Shrine', activityData: '284635225;elimination'},
		{src: 'archive/Destiny_20161206182846.mp4', name: 'Salvage: The Burning Shrine (Relic Salvaged)', activityData: '284635225;salvage'},

		{src: 'archive/Destiny_20161207120316.mp4', name: 'Patrol: Cosmodrome (Launch)', activityData: '0,30:167419252;patrol'},
		{src: 'archive/Destiny_20161207121241.mp4', name: 'Clash: The Anomaly (Launch)', activityData: '0,28:2082069870;clash'},
		{src: 'archive/Destiny_20161207121407.mp4', name: 'Supremacy: The Anomaly (Launch)', activityData: '0,28:2082069870;supremacy'},
		{src: 'archive/Destiny_20161207121532.mp4', name: 'Rift: The Anomaly (Launch)', activityData: '0,28:2082069870;rift'},
		{src: 'archive/Destiny_20161207121745.mp4', name: 'Skirmish: The Anomaly (Launch)', activityData: '0,28:2082069870;skirmish'},
		{src: 'archive/Destiny_20161207121745.mp4', name: 'Elimination: Asylum (Launch)', activityData: '0,25:3292667877;elimination'},
		{src: 'archive/Destiny_20161207122200.mp4', name: 'Rumble: Bannerfall (Launch)', activityData: '0,28:3602734434;rumble'},
		{src: 'archive/Destiny_20161207122419.mp4', name: 'Salvage: Bastion (Launch)', activityData: '0,28:4200263342;salvage'},
		{src: 'archive/Destiny_20161207122707.mp4', name: 'Zone Control: Black Shield (Launch)', activityData: '0,28:3848655103;zone-control'},
		{src: 'archive/Destiny_20161207122846.mp4', name: 'Rumble Supremacy: Blind Watch (Launch)', activityData: '0,28:2430076725;rumble-supremacy'},
		{src: 'archive/Destiny_20161207123014.mp4', name: 'Inferno Clash: The Burning Shrine (Launch)', activityData: '0,28:284635225;inferno-clash'},
		{src: 'archive/Destiny_20161207123152.mp4', name: 'Inferno Control: Cathedral of Dusk (Launch)', activityData: '0,28:3412406993;inferno-control'},
		{src: 'archive/Destiny_20161207123331.mp4', name: 'Inferno Rumble: The Cauldron (Launch)', activityData: '0,28:2680821721;inferno-rumble'},
		{src: 'archive/Destiny_20161207123509.mp4', name: 'Inferno Salvage: Crossroads (Launch)', activityData: '0,28:1719392441;inferno-salvage'},
		{src: 'archive/Destiny_20161207123644.mp4', name: 'Inferno Skirmish: The Drifter (Launch)', activityData: '0,28:1851417512;inferno-skirmish'},
		{src: 'archive/Destiny_20161207123817.mp4', name: 'Inferno Elimination: The Dungeons (Launch)', activityData: '0,28:1448094960;inferno-elimination'},
		{src: 'archive/Destiny_20161207123952.mp4', name: 'Inferno Supremacy: Exodus Blue (Launch)', activityData: '0,28:4287936726;inferno-supremacy'},
		{src: 'archive/Destiny_20161207124126.mp4', name: 'Mayhem Clash: Firebase Delphi (Launch)', activityData: '0,28:3101475152;mayhem-clash'},
		{src: 'archive/Destiny_20161207124259.mp4', name: 'Mayhem Rumble: First Light (Launch)', activityData: '0,28:3856604751;mayhem-rumble'},
		{src: 'archive/Destiny_20161207124513.mp4', name: 'Social: Tower (Launch)', activityData: '0,28:2151413729;social'}
	];

	var selections = {
		imageIndex: 17,
		videoIndex: 0,
		view: 'image'
	};

	var savedSelections = localStorage.getItem('settings');
	if (savedSelections) selections = angular.extend({}, selections, JSON.parse(savedSelections));

	$scope.selections = selections;

	$scope.selectedImage = $scope.images[$scope.selections.imageIndex];
	$scope.selectedVideo = $scope.videos[$scope.selections.videoIndex];

	$scope.$watch('selections', function(value) {
		console.log('Settings', value);
		$scope.selectedImage = $scope.images[$scope.selections.imageIndex];
		$scope.selectedVideo = $scope.videos[$scope.selections.videoIndex];

		localStorage.setItem('settings', JSON.stringify($scope.selections));
	}, true);
});
testApp.directive('asNumber', function() {
	return {
		//restrict: 'E',
		require: 'ngModel',
		link: function(scope, element, attrs, ngModel) {
			//console.log('asNumber');
			//if ($el.get(0).type === 'number') {
			ngModel.$parsers.push(function(value) {
				return value.toString();
			});

			ngModel.$formatters.push(function(value) {
				return parseFloat(value, 10);
			});
			//}
		}
	};
});
angular.bootstrap(document.getElementById('test-app'), ['testApp']);