'use strict';

var token = token || $('meta[name="csrf-token"]').attr('content'),
    TeevyLanding = angular.module('teevyLanding', []);

TeevyLanding.controller('appCtrl', ['$log', '$http', function($log, $http){
  var ac = this;

  ac.modalType = null;
  ac.errors = {};

  ac.resetErrors = function(key){
    if (key === undefined) {
      ac.errors = {};
    } else {
      delete(ac.errors[key]);
    }
  };

  ac.changeModalType = function(value){
    ac.resetErrors();
    ac.password = "";
    ac.modalType = value;
  };

  ac.logIn = function(){
    $http.post('/login', {
      user_session: {
        login: ac.login,
        password: ac.password,
      },
      authenticity_token: token
    })
      .then(function(response){
        window.location = '/app';
      }, function(response){
        ac.errors.login = "Invalid login or password";
      });
  };

  ac.signUp = function(){
    $http.post('/users', {
      user: {
        login: ac.login,
        email: ac.email,
        password: ac.password,
        password_confirmation: ac.password_confirmation
      },
      authenticity_token: token
    })
      .then(function(response){
        window.location = '/app';
      }, function(response){
        ac.errors.email = response.data.email && "Email " + response.data.email[0];
        ac.errors.login = response.data.login && "Username " + response.data.login[0];
        ac.errors.password = response.data.password && "Password " + response.data.password[0];
      });
  };
}]);

TeevyLanding.directive('modal', ['$document', function($document){
  return {
    scope: {
      modal: '='
    },
    link: function(scope, element, attrs){
      var modalOpen = false;

      $document.bind('click', outsideClickHandler);

      function outsideClickHandler(event){
        if (modalOpen){
          if ( !element.is(event.target) && !element.find(event.target).length ) {
            scope.modal = null;
            scope.$apply();
            $document.unbind('click', outsideClickHandler);
          }
        } else {
          modalOpen = true;
        }
      }
    }
  }
}]);

TeevyLanding.directive('passwordConfirmation', function(){
  return function(scope, element, attrs){
    var input_password = element.find('.password')[0],
        input_confirmation = element.find('.confirmation')[0];

    input_password.onchange = validatePassword;
    input_confirmation.onchange = validatePassword;

    function validatePassword(){
      if(input_password.value != input_confirmation.value) {
        input_confirmation.setCustomValidity("Passwords Don't Match");
      } else {
        input_confirmation.setCustomValidity('');
      }
    }
  }
})