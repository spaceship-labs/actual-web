(function(){
  'use strict';

  /**
   * @ngdoc service
   * @name dashexampleApp.AuthService
   * @description
   * # AuthService
   * Service in the dashexampleApp.
   */
  function AuthService($http, $localStorage, urls){

    var serv = this;
    serv.signUp = signUp;
    serv.signIn = signIn;
    serv.logout = logout;
    serv.getTokenClaims = getTokenClaims;

    function urlBase64Decode(str) {
      var output = str.replace('-', '+').replace('_', '/');
      switch (output.length % 4) {
       case 0:
           break;
       case 2:
           output += '==';
           break;
       case 3:
           output += '=';
           break;
       default:
           throw 'Illegal base64url string!';
      }
      return window.atob(output);
    }

    function getClaimsFromToken() {
      var token = $localStorage.token;
      var user = {};
      if (typeof token !== 'undefined') {
        var encoded = token.split('.')[1];
        user = JSON.parse(urlBase64Decode(encoded));
      }
      return user;
    }

    var tokenClaims = getClaimsFromToken();

    function signUp(data, success, error) {
       $http.post(urls.BASE + '/auth/signup', data).success(success).error(error);
    }

    function signIn(data, success, error) {
       $http.post(urls.BASE + '/auth/signin', data).success(success).error(error);
    }

    function logout(success) {
       tokenClaims = {};
       delete $localStorage.token;
       delete $localStorage.user;
       success();
    }

    function getTokenClaims() {
       return tokenClaims;
    }

  }
  angular.module('dashexampleApp').service('AuthService', AuthService);
  AuthService.$inject = ['$http', '$localStorage', 'urls'];

})();
