(function(){

  'use strict';

  /**
   * @ngdoc function
   * @name dashexampleApp.controller:MainCtrl
   * @description
   * # MainCtrl
   * Controller of the dashexampleApp
   */
  function MainCtrl($rootScope, $q, $scope, $location, $window, $route, $mdSidenav, authService, localStorageService, cartService, productService, categoriesService, quotationService){
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
    vm.toggleLoginModal = toggleLoginModal;

    vm.activateCartModal = activateCartModal;
    vm.deactivateCartModal = deactivateCartModal;

    vm.logOut = logOut;
    vm.signIn = signIn;

    vm.getActiveQuotation = getActiveQuotation;

    vm.cart.products = cartService.getProducts();

    vm.isMiActual = $rootScope.isMiActual;
    vm.init = init;
    vm.getCategoryIcon = getCategoryIcon;
    vm.togglePointerSidenav = togglePointerSidenav;

    vm.pointersSidenav = [];

    function init(){
      vm.token = localStorageService.get('token');
      vm.user = localStorageService.get('user');
      $rootScope.user = vm.user;
      for(var i=0;i<9;i++){
        vm.pointersSidenav.push({selected:false});
      }
      categoriesService.createCategoriesTree().then(function(res){
        vm.categoriesTree = res.data;
      });

      if($rootScope.user){
        vm.getActiveQuotation();
      }
    }

    function togglePointerSidenav(){
      $mdSidenav('right').toggle();
    }

    function getCategoryIcon(handle){
      return categoriesService.getCategoryIcon(handle);
    }

    function getActiveQuotation(){
      console.log('getActiveQuotation');
      cartService.getActiveQuotation().then(function(res){
        $rootScope.activeQuotation = res.data;
        vm.activeQuotation = res.data;
        quotationService.getQuotationProducts(vm.activeQuotation).then(function(details){
          $rootScope.activeQuotation.Details = details;
          vm.activeQuotation.Details = details;
          console.log(vm.activeQuotation);
        });
      });
    }

    $scope.$on('$routeChangeStart', function(next, current) {
      console.log(next,current);
      vm.menuCategoriesOn = false;
    });

    $rootScope.$on('newActiveQuotation', function(event, data){
      if($rootScope.user){
        vm.getActiveQuotation();
      }
    });

    vm.init();

    function toggleLoginModal(){
      if( vm.isActiveLogin ){
        vm.isActiveLogin = false;
        vm.isActiveBackdrop = false;
      }else{
        vm.isActiveLogin = true;
        vm.isActiveBackdrop = true;
      }
    }


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
      vm.isActiveCart = true;
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
        localStorageService.remove('currentQuotation');
        $location.path('/');
        $window.location.reload();
      });
    }

    $rootScope.successAuth = function(res){
      console.log(res);
      localStorageService.remove('currentQuotation');
      localStorageService.set('token', res.token);
      localStorageService.set('user', res.user);

      vm.token = res.token;
      vm.user = res.user;

      //$location.path('/');
      $window.location.reload();

    };

    $scope.$on('$routeChangeStart', function(next, current) {
      vm.menuCategoriesOn = false;
      vm.isActiveBackdrop = false;
      vm.isActiveLogin = false;
      vm.isActiveCart = false;
      vm.isLoadingLogin = false;

      //console.log('route change');
      //console.log('vm.isActiveLogin:' + vm.isActiveLogin);
      //m.toggleLoginModal();
    });


  }

  angular.module('dashexampleApp').controller('MainCtrl', MainCtrl);
  MainCtrl.$inject = [
    '$rootScope',
    '$q',
    '$scope',
    '$location',
    '$window',
    '$route',
    '$mdSidenav',
    'authService',
    'localStorageService',
    'cartService',
    'productService',
    'categoriesService',
    'quotationService'
  ];

})();


