var destinyTwitchApp = angular.module('destinyTwitchApp', ['bungienetapi']);
destinyTwitchApp.filter('extension', ['$sce', function($sce){
	return function(value) {
		return $sce.trustAsResourceUrl(value);
	};
}]);
destinyTwitchApp.controller('EmbedCtrl', function($scope, $bnetapi, $extapi, $interval) {
	console.log('EmbedCtrl');

	var defaults = {
		hsize: 59,
		vsize: 33
	};

	$scope.viewers = 0;

	$scope.tests = [];
	$scope.statuses = {};
	$scope.activityHash = 0;
	$scope.activityMode = false;
	//$scope.activityModeHash = 0;
	$scope.activity = false;

	$scope.showCalibrate = false;
	$scope.calibrateImage = false;
	$scope.data = angular.copy(defaults);

	var streamingInfo = false;

	$scope.isTesting = false;

	var lastUpdate = 0;
	//var updateCount = 0;
	var isUpdating = false;
	$interval(function() {
		if ($scope.isTesting) return;
		var thisUpdate = new Date().getTime();
		if (streamingInfo && !isUpdating && thisUpdate - lastUpdate > 1000) {
			lastUpdate = thisUpdate;
			isUpdating = true;

			// GetAccount
			$bnetapi.getAccount(streamingInfo.membershipId, streamingInfo.membershipType).then(function(response) {
				//console.log('GetAccount', response);
				isUpdating = false;
				if (response.ErrorCode == 1) {
					var data = response.Response.data;
					var currentCharacter = data.characters[0];

					var info = {
						dateLastPlayed: data.dateLastPlayed,
						characterId: currentCharacter.characterBase.characterId,
						currentActivityHash: currentCharacter.characterBase.currentActivityHash
					};

					console.log('GetAccount', info);
					//streamingInfo = response.Response.data;
					$scope.activityHash = info.currentActivityHash;
					/*$extapi.send('setActivity', {
						activity: $scope.activityHash,
						mode: $scope.activityMode
					});*/
				} else {
					console.log('GetStreamingStatusForMember-Error', response);
				}
			});

			// GetStreamingStatusForMember
			/*if (updateCount == 0) {
				$bnetapi.getStreamingStatus(streamingInfo.membershipId, streamingInfo.membershipType).then(function(response) {
					//console.log('GetStreamingStatusForMember', response);
					isUpdating = false;
					if (response.ErrorCode == 1) {
						var data = response.Response;
						var info = {
							dateLastPlayed: data.dateLastPlayed,
							characterId: data.destinyCharacterId,
							currentActivityHash: data.currentActivityHash,
							activityModeHash: data.activityModeHash,
							currentViewers: data.currentViewers,
							dateStatusUpdated: data.dateStatusUpdated
						};
						console.log('CommunityLiveStatus'+"\n", info);
						//streamingInfo = response.Response.data;
						//$scope.activityHash = accountInfo.characters[0].characterBase.currentActivityHash;
						$scope.viewers = info.currentViewers;
						//$scope.activityHash = data.currentActivityHash;
						//$scope.activityModeHash = data.activityModeHash;
						//$extapi.send('setActivity', {activity: $scope.activityHash, mode: $scope.activityModeHash});
					} else {
						console.log('GetStreamingStatusForMember-Error', response);
					}
				});
			}
			updateCount++;
			if (updateCount >= 5) {
				updateCount = 0;
			}*/
		}
	}, 1000);

	$scope.loadBounds = function() {
		$extapi.getStorage($scope.data).then(function(data) {
			console.log('Loaded Bounds', data);
			$scope.data = data;
		});
		$scope.close();
	};

	$scope.calibrate = function() {
		console.log('Open Calibrate');
		$scope.showCalibrate = true;
		$extapi.send('toggleCalibrate', true);
	};

	$scope.close = function() {
		$scope.showCalibrate = false;
		$extapi.send('toggleCalibrate', false);
	};
	$scope.nothing = function() {

	};
	$scope.incBounds = function(direction, inc) {
		$scope.data[direction] += inc;
	};
	$scope.updateBounds = function() {
		console.log('Update Bounds', $scope.data);
		$extapi.setStorage($scope.data);
		$scope.close();
	};
	$scope.resetBounds = function() {
		$scope.data.hsize = defaults.hsize;
		$scope.data.vsize = defaults.vsize;
		$scope.updateBounds();
	};

	$scope.$on('action', function(event, request) {
		switch(request.action) {
			case 'update':
				$scope.tests = request.tests;
				$scope.statuses = request.statuses;
				$scope.$apply();
				break;
			case 'testActivity':
				//console.log('FrontEnd-TestActivity', request);
				$scope.isTesting = request.activity != -1;
				if ($scope.isTesting) {
					var activityData = request.activity.split(';');
					$scope.activityHash = activityData[0];
					if (activityData.length > 1) $scope.activityMode = activityData[1];
				}
				break;
			case 'setAccount':
				console.log('FrontEnd-Account', request);
				streamingInfo = {
					membershipId: request.membershipId,
					membershipType: request.membershipType
				};
				$scope.isTesting = false;
				break;
			case 'updateCalibrate':
				//console.log('FrontEnd-Calibrate');
				$scope.calibrateImage = request.value;
				break;
			default:
				console.log('FrontEnd', request);
				break;
		}
	});

	$extapi.connect($scope);

	$scope.$watch('data', function() {
		$extapi.send('setBounds', $scope.data);
	}, true);

	$scope.$watch('activityHash', function(activityHash) {
		console.log('ChangedActivity', activityHash);
		if (activityHash != 0) {
			$bnetapi.getActivity(activityHash).then(function(response) {
				if (response.ErrorCode == 1) {
					var activity = response.Response.data.activity;
					//activity.activityTypeName = activityTypes[activity.activityTypeHash] ? activityTypes[activity.activityTypeHash] : activity.activityTypeHash;
					console.log('Activity', activity);
					$scope.activity = activity;
				} else {
					console.log('GetActivity', response);
				}
			});
		} else {
			$scope.activity = {
				activityName: 'In Orbit',
				activityDescription: 'Nothing to see here.'
			};
		}
		$extapi.send('setActivity', {
			activity: activityHash
		});
		$scope.activityMode = false;
	});
	$scope.$watch('activityMode', function(activityMode) {
		console.log('ChangedActivityMode', activityMode);
		$extapi.send('setActivityMode', {
			mode: activityMode
		});
	});

	$scope.loadBounds();

	// Update Capture
	/*var calibrateCanvas = false;

	$scope.$watch('showCalibrate', function(value) {
		if (value) {
			setTimeout(function() {
				calibrateCanvas = document.getElementById('calibrate-canvas');
				//console.log(calibrateCanvas);
			}, 100);
		}
	});*/
});
destinyTwitchApp.directive('dtTest', function() {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			var test = scope.test;
			//console.log('Test', test, testUrl);

			scope.$watch('test', function() {
				var data = test.diffData;
				if (!data) return;
				//console.log('Test', data);
				scope.diffPct = (100-data.rawMisMatchPercentage).toFixed(2)+'%'+(test.status.value == test.value ? ' Match' : '');
			}, true);
		}
	};
});
destinyTwitchApp.factory('$extapi', function($q) {
	var frontPort = chrome.runtime.connect({name: 'destiny-twitch'});
	var $self = {
		connect: function($scope) {
			frontPort.postMessage({
				action: 'connect',
				type: 'frontend'
			});
			frontPort.onMessage.addListener(function(request) {
				$scope.$broadcast('action', request);
			});
		},
		send: function(action, data) {
			if (typeof data !== 'object') data = {value: data};
			data.action = action;
			data.url = window.location.href;
			frontPort.postMessage(data);
		},
		getStorage: function(defaultData) {
			if (defaultData == undefined) defaultData = {};
			var defer = $q.defer();
			chrome.storage.sync.get(defaultData, function(data) {
				defer.resolve(data);
			});
			return defer.promise;
		},
		setStorage: function(data) {
			if (data == undefined) data = {};
			var defer = $q.defer();
			chrome.storage.sync.set(data, function() {
				defer.resolve();
			});
			return defer.promise;
		}
	};
	return $self;
});