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

      var USER_ROLES = {
        ADMIN         : 'admin',
        BROKER        : 'broker',
        SELLER        : 'seller',
        STORE_MANAGER : 'store manager'
      };

      var service = {
        authManager: authManager,
        signUp: signUp,
        signIn: signIn,
        logout: logout,
        dennyAccessBroker: dennyAccessBroker,
        dennyAccessStoreManager: dennyAccessStoreManager,
        isUserAdmin: isUserAdmin,
        isBroker: isBroker,
        isUserAdminOrManager:isUserAdminOrManager,
        isUserSellerOrAdmin:isUserSellerOrAdmin,
        isUserManager: isUserManager,
        runPolicies: runPolicies,
        USER_ROLES: USER_ROLES
      };

      return service;


      function signUp(data, success, error) {
         $http.post(api.baseUrl + '/user/create', data)
          .then(success)
          .catch(error);
      }

      function signIn(data, success, error) {
        localStorageService.remove('token');
        localStorageService.remove('user');
        localStorageService.remove('quotation');
        localStorageService.remove('broker');
        return $http.post(api.baseUrl + '/auth/signin', data)
          .then(success)
          .catch(error);
      }

      function authManager(params){
        var url = '/auth/manager';
        return api.$http.post(url, params);
      }

      function logout(successCB) {
        localStorageService.remove('token');
        localStorageService.remove('user');
        localStorageService.remove('activeStore');
        localStorageService.remove('companyActive');
        localStorageService.remove('companyActiveName');

        console.log('loging out', $rootScope.activeQuotation);
        if($rootScope.activeQuotation && $rootScope.activeQuotation.Client){
          localStorageService.remove('quotation');
        }

        delete $rootScope.user;
        if(successCB){
          successCB();
        }
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

      function isUserAdmin(user){
        return user.role === USER_ROLES.ADMIN;
      }

      function isBroker(user){
        return !!(user && user.role && user.role.name === USER_ROLES.BROKER);
      }

      function isStoreManager(user){
        return !!(user && user.role && user.role.name === USER_ROLES.BROKER);
      }

      function isUserAdminOrManager(){
        return $rootScope.user.role && 
          ( $rootScope.user.role.name === USER_ROLES.ADMIN 
            || $rootScope.user.role.name === USER_ROLES.STORE_MANAGER 
          );
      }  

      function isUserSellerOrAdmin(){
        if(!$rootScope.user){
          return false;
        }

        return $rootScope.user.role && 
          ( $rootScope.user.role === USER_ROLES.ADMIN 
            || $rootScope.user.role === USER_ROLES.SELLER 
          );
      }     

      function isUserManager(){
        return $rootScope.user.role.name === USER_ROLES.STORE_MANAGER 
          && $rootScope.user.mainStore;
      }       

      function runPolicies(){
        var _token = localStorageService.get('token') || false;
        var _user  = localStorageService.get('user')  || false;
        var currentPath = $location.path();
        var privatePaths = [
          '/user/profile'
        ];
        var isPrivatePath = function(path){
          return privatePaths.indexOf(path) > -1;
        };

        //Check if token is expired
        if(_token){
            var expiration = jwtHelper.getTokenExpirationDate(_token);
            if(expiration <= new Date()){
              logout(function(){
                $location.path('/');
              });
            }else{
              userService.getMyUser()
                .then(function(res){
                  console.log('getUser', res);
                  _user = res;
                  localStorageService.set('user', _user);
                  $rootScope.user = _user;
                })
                .catch(function(err){
                  console.log('err', err);
                });
            }
        }else{
          console.log('else');
          logout();
          if(isPrivatePath(currentPath)){
            $location.path('/');
          }
        }
      }      

    }
})();
