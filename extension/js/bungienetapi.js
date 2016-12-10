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