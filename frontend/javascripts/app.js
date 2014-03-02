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
      Subscription.all() // make sure all subscriptions are loaded
        .then(function(){
          Subscription.create(show.id)
            .then(function(response){
              show.pending = false;
              show.subscription_id = response.id;
            });
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
      Subscription.all() // make sure all subscriptions are loaded
        .then(function(){
          Subscription.create(show.id)
            .then(function(response){
              show.pending = false;
              show.subscription_id = response.id;
            });
        });
    };

    $scope.unsubscribe = function(show){
      show.pending = true;
      Subscription.delete(show.subscription_id)
        .then(function(){
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
    var cache = [],
        id_index = {};

    return {
      all: function(){
        if ( cache.length === 0 ) {
          return $http.get('/shows')
            .then(function(response){
              angular.forEach(response.data, function(show, index){
                id_index[show.id] = index;
                cache[index] = show;
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
        var deferred = $q.defer();
        deferred.resolve( cache[ id_index[id] ] );
        return deferred.promise;
      }
    }
  }]);

  TeevyApp.factory("Episode", ['$http', '$q', '$log', function($http, $q, $log){
    var cache = {};

    return {
      all: function(show_id){
        if ( !cache['show_' + show_id] ) {
          return $http.get('/shows/' + show_id + '/episodes/')
            .then(function(response){
              cache['show_' + show_id] = response.data;
              return cache['show_' + show_id];
            });
        } else {
          var deferred = $q.defer();
          deferred.resolve( cache['show_' + show_id] );
          return deferred.promise;
        }
      }
    }
  }]);

  TeevyApp.factory('Subscription', ['$http', '$q', '$log', 'Episode', function($http, $q, $log, Episode){
    var cache = [],
        id_index = {};

    return {
      all: function(){
        if ( cache.length === 0 ) {
          return $http.get('/users/current/subscriptions')
            .then(function(response){
              angular.forEach(response.data, function(item, index){
                id_index[item.id] = index;
                cache[index] = item;
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
        if ( cache[ id_index[id] ] ) {
          var deferred = $q.defer();
          deferred.resolve(cache[ id_index[id] ]);
          return deferred.promise;
        } else {
          return api.all()
            .then(function(){
              return cache[ id_index[id] ];
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
            cache[ id_index[id] ].next_unseen = response.data.next_unseen;
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
            cache.push( response.data );
            id_index[response.data.id] = cache.length - 1;
            return cache[ id_index[response.data.id] ];
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
            cache.splice(id_index[id], 1);
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

  TeevyApp.directive('subscriptionTile', ['$log', '$timeout', 'Show', 'Episode', 'Subscription', function($log, $timeout, Show, Episode, Subscription){
    return {
      restrict: 'E',
      templateUrl: 'subscription-tile.html',
      scope: {
        subscription: '='
      },
      link: function(scope, element, attrs){
        scope.isAired = function(ep){
          return ep && moment().format() > ep.aired_at;
        };

        scope.config = false;
        scope.manual = false;
        scope.initialized = true;
        scope.sawLastAired = !scope.isAired(scope.subscription.next_unseen);

        if (!scope.subscription.next_unseen) {
          scope.config = true;
          scope.initialized = false;
        }

        scope.selectEpisode = function(episode){
          if ( scope.isAired(episode) ) scope.selected_episode = episode;
        };

        scope.setEpisode = function(option, episode_id){
          scope.pending = true;
          Subscription.update(scope.subscription.id, option, episode_id)
            .then(function(response){
              scope.pending = false;
              scope.config = false;
              scope.sawLastAired = !scope.isAired(scope.subscription.next_unseen);
              // half of animation duration
              $timeout(function(){
                scope.initialized = true;
              }, 400);
            });
        };

        scope.enterConfig = function(){
          scope.manual = false;
          scope.config = true;
        };

        scope.exitConfig = function(){
          scope.config = false;
        }

        scope.enterManual = function(){
          Episode.all(scope.subscription.show.id)
            .then(function(response){
              scope.episodes = response;
              scope.selected_episode = response[0];
              scope.manual = true;
            });
        }

        scope.unsubscribe = function(){
          Show.get(scope.subscription.show.id)
            .then(function(response){
              var show = response;

              scope.pending = true;
              Subscription.delete(scope.subscription.id)
                .then(function(){
                  scope.pending = false;
                  show.subscription_id = null;
                  scope.$apply();
                });
            });
        }
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

