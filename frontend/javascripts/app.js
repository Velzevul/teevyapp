'use strict';

var token = token || $('meta[name="csrf-token"]').attr('content'),
    TeevyApp = angular.module('teevyApp', ['ngRoute', 'truncate']);

TeevyApp.config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/dashboard', {
      templateUrl: "dashboard.html",
      controller: "dashboardCtrl"
    })
    .when('/explore',{
      templateUrl: "explore.html",
      controller: "exploreCtrl"
    })
    .otherwise({
      redirectTo: '/dashboard'
    });
}]);

// controllers

  TeevyApp.controller('dashboardCtrl', ['$scope', 'Subscription', function($scope, Subscription){
    Subscription.all()
      .then(function(data){
        $scope.subscriptions = data;
      });
  }]);

  TeevyApp.controller('exploreCtrl', ['$scope', 'Show', 'Subscription', function($scope, Show, Subscription){
    Show.all()
      .then(function(data){
        $scope.shows = data;
      });

    $scope.subscribe = function(show){
      show.pending = true;
      Subscription.create(show.id)
        .then(function(response){
          show.pending = false;
          show.subscription_id = response.id;
        });
    }

    $scope.unsubscribe = function(show){
      show.pending = true;
      Subscription.delete(show.subscription_id)
        .then(function(){
          show.pending = false;
          show.subscription_id = null;
          $scope.$apply();
        })
    }
  }]);

  TeevyApp.controller('userCtrl', ['$scope', 'User', function($scope, User){
    User.getUserInfo()
      .then(function(response){
        $scope.user = response.data;
      });

    $scope.logout = User.logoutUser;

    $scope.showMenu = false;
  }]);

  TeevyApp.controller('appCtrl', ['$scope', '$location', 'Show', 'Subscription', 'filterFilter', function($scope, $location, Show, Subscription, filterFilter){
    Show.all()
      .then(function(data){
        $scope.shows = data;
      });

    $scope.showSearchResults = false;

    $scope.isActive = function(value){
      if ($location.path().slice(1) === value) return 'active';
    };

    $scope.subscribe = function(show){
      show.pending = true;
      Subscription.create(show.id)
        .then(function(response){
          show.pending = false;
          show.subscription_id = response.id;
        });
    };

    $scope.unsubscribe = function(show){
      show.pending = true;
      Subscription.delete(show.subscription_id)
        .then(function(){
          console.log('from ctrl');
          show.pending = false;
          show.subscription_id = null;
          $scope.$apply();
        });
    };

    $scope.$watch('search', function(search){
      // use filter here instead of temaplte due to necessity of using filteredShows for "no results found"
      $scope.filteredShows = filterFilter($scope.shows, {title: search});
      $scope.showSearchResults = search && search.length > 2;
    });
  }]);

// services

  TeevyApp.factory('User', ['$http', '$log', function($http, $log){
    return {
      getUserInfo: function(){
        return $http.get('/users/current');
      },
      logoutUser: function(){
        $http.post('/logout', {
          authenticity_token: token
        })
          .then(function(){
            window.location = '/';
          }, function(){
            $log.error('error during logout...');
          });
      }
    }
  }]);

  TeevyApp.factory('Show', ['$http', '$q', '$log', function($http, $q, $log){
    var cache = [];

    return {
      all: function(){
        if ( cache.length === 0 ) {
          return $http.get('/shows')
            .then(function(response){
              cache = response.data;
              return cache;
            });
        } else {
          var deferred = $q.defer();
          deferred.resolve( cache );
          return deferred.promise;
        }
      }
    }
  }]);

  TeevyApp.factory("Episode", ['$http', '$q', '$log', function($http, $q, $log){
    var cache = [];

    return {
      all: function(show_id){
        if ( cache.length === 0 ) {
          return $http.get('/shows/' + show_id + '/episodes/')
            .then(function(response){
              cache = response.data;
              return cache;
            });
        } else {
          var deferred = $q.defer();
          deferred.resolve( cache );
          return deferred.promise;
        }
      }
    }
  }]);

  TeevyApp.factory('Subscription', ['$http', '$q', '$log', 'Episode', function($http, $q, $log, Episode){
    var cache = {};

    return {
      all: function(){
        if ( angular.element.isEmptyObject(cache) ) {
          return $http.get('/users/current/subscriptions')
            .then(function(response){
              angular.forEach(response.data, function(item){
                cache[item.id] = item;
              });
              return cache;
            });
        } else {
          var deferred = $q.defer();
          deferred.resolve( cache );
          return deferred.promise;
        }
      },
      get: function(id){
        if ( cache[id] ) {
          var deferred = $q.defer();
          deferred.resolve(cache[id]);
          return deferred.promise;
        } else {
          return api.all()
            .then(function(){
              return cache[id];
            });
        }
      },
      update: function(id, option, episode_id){
        return $http.put('/users/current/subscriptions/' + id + '.json', {
          option: option,
          episode_id: episode_id,
          authenticity_token: token
        })
          .then(function(response){
            return response.data;
          }, function(){
            $log.error('Could not set next episode on server');
          });
      },
      create: function(show_id){
        return $http.post('/users/current/subscriptions',{
          subscription: {
            show_id: show_id
          },
          authenticity_token: token
        })
          .then(function(response){
            cache[response.data.id] = response.data;
            return cache[response.data.id];
          });
      },
      delete: function(id){
        // $http.delete does not send authenticity_token for some reason...
        return $.ajax('/users/current/subscriptions/' + id,{
          type: 'DELETE',
          data: {
            authenticity_token: token
          }
        })
          .then(function(response){
            delete cache[id];
            return response;
          }, function(a,b,c){
            $log.error('error while deletion: ', a, b, c);
          });
      }
    }
  }]);

// directives

  TeevyApp.directive('dropdown', ['$document', function($document){
    return {
      scope: {
        open: '='
      },
      link: function(scope, element, attributes){
        var dropdownEl = element.find('.dropdown');

        scope.$watch('open', function(value){
          if (value) {
            dropdownEl.show();
            $document.bind('click', outsideClickHandler);
          } else {
            dropdownEl.hide();
            $document.unbind('click', outsideClickHandler);
          }
        });

        function outsideClickHandler(event){
          if ( !element.is(event.target) && !element.find(event.target).length ) {
            scope.open = false;
            scope.$apply();
          }
        }
      }
    }
  }]);

  TeevyApp.directive('subscriptionTile', ['$log', 'Subscription', 'Episode', function($log, Subscription, Episode){
    return {
      restrict: 'E',
      templateUrl: 'subscription-tile.html',
      scope: {
        subscription: '='
      },
      link: function(scope, element, attrs){
        scope.episodeIsSet = (scope.subscription.next_unseen != null);
        scope.settingsMode = false;
        scope.manualMode = false;

        scope.selectEpisode = function(episode){
          if ( scope.isAired(episode) ) scope.selected_episode = episode;
        };

        scope.setEpisode = function(option, episode_id){
          scope.pending = true;
          Subscription.update(scope.subscription.id, option, episode_id)
            .then(function(response){
              scope.pending = false;
              scope.settingsMode = false;
              scope.subscription.next_unseen = response;
              scope.sawLastAired = !scope.isAired(scope.subscription.next_unseen);
            });
        };

        scope.turnSettingsModeOn = function(){
          scope.manualMode = false;
          Episode.all(scope.subscription.show.id)
            .then(function(response){
              scope.episodes = response;
              scope.selected_episode = response[0];
              scope.settingsMode = true;
            });
        };

        scope.unsubscribe = function(){
          scope.pending = true;
          Subscription.delete(scope.subscription.id)
            .then(function(){
              scope.pending = false;
              scope.$apply();
            })
        }

        scope.turnManualModeOn = function(){
          scope.manualMode = true;
        };

        scope.turnManualModeOff = function(){
          scope.manualMode = false;
        };

        scope.turnSettingsModeOff = function(){
          scope.settingsMode = false;
        };

        scope.isAired = function(ep){
          return ep && moment().format() > ep.aired_at;
        };

        scope.sawLastAired = !scope.isAired(scope.subscription.next_unseen);
      }
    }
  }]);

// filters

  TeevyApp.filter('date', function(){
    return function(input, f){
      if (moment(input).isValid()) {
        return moment(input).format(f)
      }
      return input;
    }
  });

// utilities

  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function getValuesArr(obj) {
    var res = [];

    for(key in obj) {
      if(obj.hasOwnProperty(key)) {
        res.push(obj[key]);
      }
    }

    return res;
  }

