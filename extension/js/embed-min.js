angular.module('bungienetapi', [])
	/*.config(function ($httpProvider) {
		$httpProvider.defaults.transformRequest = function(data){
			if (data === undefined) {
				return data;
			}
			return $.param(data);
		}
	})*/
	.factory('$bnetapi', function($http) {
		var domain = 'https://www.bungie.net';
		var $self = {
			_defer: function(request, parse, errorMessage) {
				return request.then(function(response) {
					return parse ? $self._parseResult(response.data, errorMessage) : response.data;
				});
			},
			_parseResult: function(result, errorMessage) {
				if (errorMessage == undefined) errorMessage = {
					status: 'Invalid Response from Bungie.net',
					message: 'Bungie.net appears to be under heavy load at the moment.'
				};
				try {
					return typeof result == 'string' ? JSON.parse(result) : result;
				} catch (e) {
					return {
						ErrorCode: -1,
						Response: 0,
						ThrottleSeconds: 0,
						ErrorStatus: errorMessage.status,
						Message: errorMessage.message,
						MessageData: {}
					};
				}
			},
			_request: function(url, method, data) {
				if (method == undefined) method = 'get';
				url = domain+url;
				var request = {
					method: method.toUpperCase(),
					url: url,
					headers: {
						'X-API-Key': '9cee0c55757c46fab92aa2cf3a4e394b'
					},
					transformRequest: false
				};
				return $self._defer($http(request));
			},
			getAccount: function(destinyMembershipId, membershipType) {
				return $self._request('/Platform/Destiny/'+membershipType+'/Account/'+destinyMembershipId+'/');
			},
			getActivity: function(activityHash) {
				return $self._request('/Platform/Destiny/Manifest/1/'+activityHash+'/');
			},
			getStreamingStatus: function(membershipId, membershipType, partnershipType) {
				if (partnershipType == undefined) partnershipType = 1; // Default to Twitch
				return $self._request('/Platform/CommunityContent/Live/Users/'+partnershipType+'/'+membershipType+'/'+membershipId+'/');
			}
		};
		return $self;
	})
;

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

