(function(){

  'use strict';

  /**
   * @ngdoc function
   * @name dashexampleApp.controller:MainCtrl
   * @description
   * # MainCtrl
   * Controller of the dashexampleApp
   */
  function MainCtrl($rootScope, $scope, $location, $window, $route, authService, localStorageService, cartService, productService, categoriesService){
    var vm = this;
    vm.menuCategoriesOn = false;
    vm.isActiveBackdrop = false;
    vm.isActiveLogin = false;
    vm.isActiveCart = false;
    vm.isLoadingLogin = false;
    vm.cart = {};
    vm.logInForm = {};

    vm.activateLoginModal = activateLoginModal;
    vm.deactivateLoginModal = deactivateLoginModal;

    vm.activateCartModal = activateCartModal;
    vm.deactivateCartModal = deactivateCartModal;

    vm.logOut = logOut;
    vm.signIn = signIn;

    vm.cart.products = cartService.getProducts();
    vm.categories = categoriesService.getCategories();

    vm.isMiActual = $rootScope.isMiActual;
    vm.init = init;
    vm.getCategoryIcon = getCategoryIcon;

    function init(){
      vm.token = localStorageService.get('token');
      vm.user = localStorageService.get('user');

      categoriesService.createCategoriesTree().then(function(res){
        //console.log(res);
        console.log(res);
        vm.categoriesTree = res.data;
      });
    };

    function getCategoryIcon(handle){
      return categoriesService.getCategoryIcon(handle);
    }

    $scope.$on('$routeChangeStart', function(next, current) {
      console.log(next,current);
      vm.menuCategoriesOn = false;
    });

    vm.init();

    function activateLoginModal(){
      if(!vm.user){
        vm.isActiveLogin = true;
        vm.isActiveBackdrop = true;
      }
    }

    function deactivateLoginModal(){
      if(!vm.user){
        vm.isActiveLogin = false;
        vm.isActiveBackdrop = false;
      }
    }

    function activateCartModal(){
      vm.isActiveLogin = true;
      vm.isActiveBackdrop = true;
    }

    function deactivateCartModal(){
      vm.isActiveCart = false;
      vm.isActiveBackdrop = false;
    }


    function signIn(){
      vm.isLoadingLogin = true;

      var formData = {
        email: vm.logInForm.email,
        password: vm.logInForm.password
      };


      authService.signIn(formData, $rootScope.successAuth, function(){
        //Error
        console.log('Invalid');
        vm.isLoadingLogin = false;
      });

    }

    function logOut(){
      authService.logout(function(){
        $location.path('/');
        $window.location.reload();
      });
    }

    $rootScope.successAuth = function(res){
      console.log(res);
      localStorageService.set('token', res.token);
      localStorageService.set('user', res.user);

      vm.token = res.token;
      vm.user = res.user;

      //$location.path('/');
      $window.location.reload();

    };



  }

  angular.module('dashexampleApp').controller('MainCtrl', MainCtrl);
  MainCtrl.$inject = [
    '$rootScope',
    '$scope',
    '$location',
    '$window',
    '$route',
    'authService',
    'localStorageService',
    'cartService',
    'productService',
    'categoriesService'
  ];

})();


