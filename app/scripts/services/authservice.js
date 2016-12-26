(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('authService', authService);

    /** @ngInject */
    function authService(
      $http,
      $rootScope,
      $location,
      localStorageService, 
      api,
      jwtHelper,
      userService
    ){

      var service = {
        authManager: authManager,
        signUp: signUp,
        signIn: signIn,
        logout: logout,
        dennyAccessBroker: dennyAccessBroker,
        dennyAccessStoreManager: dennyAccessStoreManager,
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

      function authManager(params){
        var url = '/auth/manager';
        console.log(url);
        return api.$http.post(url, params);
      }

      function logout(success) {
        localStorageService.remove('token');
        localStorageService.remove('user');
        localStorageService.remove('quotation');
        localStorageService.remove('broker');
        localStorageService.remove('activeStore');
        localStorageService.remove('activeStoreName');
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

      function dennyAccessStoreManager(){
        var _user = localStorageService.get('user');
        if( isStoreManager(_user) ){
          $location.path('/');
        }
      }

      function isBroker(user){
        return !!(user && user.role && user.role.name == 'broker');
      }

      function isStoreManager(user){
        return !!(user && user.role && user.role.name == 'store manager');
      }

    }
})();
