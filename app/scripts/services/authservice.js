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
        dennyAccessBroker: dennyAccessBroker,
        isBroker: isBroker
      };

      return service;


      function signUp(data, success, error) {
         $http.post(api.baseUrl + '/user/create', data).success(success).error(error);
      }

      function signIn(data, success, error) {
        localStorageService.remove('token');
        localStorageService.remove('user');
        localStorageService.remove('quotation');
        localStorageService.remove('broker');
        $http.post(api.baseUrl + '/auth/signin', data).success(success).error(error);
      }

      function logout(success) {
        localStorageService.remove('token');
        localStorageService.remove('user');
        localStorageService.remove('quotation');
        localStorageService.remove('broker');
        localStorageService.remove('companyActive');
        localStorageService.remove('companyActiveName');
        localStorageService.remove('currentQuotation');
        delete $rootScope.user;
        success();
      }

      function dennyAccessBroker(){
        var _user = localStorageService.get('user');
        if( isBroker(_user) ){
          $location.path('/');
        }
      }

      function isBroker(user){
        var role = user.role || {};
        if(role.name == 'broker'){
          return true;
        }
        return false;
      }

    }


})();
