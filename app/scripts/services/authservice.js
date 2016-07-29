(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('authService', authService);

    /** @ngInject */
    function authService($http,$rootScope,$location,localStorageService, api){

      var service = {
        signUp: signUp,
        signIn: signIn,
        logout: logout,
        dennyAccessBroker: dennyAccessBroker
      };

      return service;


      function signUp(data, success, error) {
         $http.post(api.baseUrl + '/user/create', data).success(success).error(error);
      }

      function signIn(data, success, error) {
        localStorageService.remove('token');
        localStorageService.remove('user');
        localStorageService.remove('quotation');
        $http.post(api.baseUrl + '/auth/signin', data).success(success).error(error);
      }

      function logout(success) {
        localStorageService.remove('token');
        localStorageService.remove('user');
        localStorageService.remove('quotation');
        localStorageService.remove('companyActive');
        localStorageService.remove('currentQuotation');
        delete $rootScope.user;
        success();
      }

      function dennyAccessBroker(){
        var _user = localStorageService.get('user');
        if(_user.userType == 'broker'){
          $location.path('/');
        }
      }

    }


})();
