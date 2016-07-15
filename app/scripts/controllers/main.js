(function(){

  'use strict';

  /**
   * @ngdoc function
   * @name dashexampleApp.controller:MainCtrl
   * @description
   * # MainCtrl
   * Controller of the dashexampleApp
   */
  function MainCtrl($rootScope, $q, $scope, $location, $window, $route, $mdSidenav, authService, cartService, productService, categoriesService, quotationService, jwtHelper, localStorageService, userService){
    var vm = this;
    vm.menuCategoriesOn = false;
    vm.isActiveBackdrop = false;
    vm.isActiveLogin = false;
    vm.isActiveCart = false;
    vm.isLoadingLogin = false;
    vm.cart = {};
    vm.logInForm = {};
    vm.menuCategories = [];

    vm.activateLoginModal = activateLoginModal;
    vm.deactivateLoginModal = deactivateLoginModal;
    vm.toggleLoginModal = toggleLoginModal;

    vm.toggleProfileModal = toggleProfileModal;

    vm.toggleMenuCategory = toggleMenuCategory;

    vm.toggleCartModal = toggleCartModal;
    vm.activateCartModal = activateCartModal;
    vm.deactivateCartModal = deactivateCartModal;

    vm.logOut = logOut;
    vm.signIn = signIn;
    vm.getActiveModule = getActiveModule;

    vm.getActiveQuotation = getActiveQuotation;

    vm.isMiActual = $rootScope.isMiActual;
    vm.init = init;
    vm.getCategoryIcon = getCategoryIcon;
    vm.togglePointerSidenav = togglePointerSidenav;

    vm.validateUser = validateUser;

    vm.pointersSidenav = [];

    function toggleMenuCategory(index){
      vm.menuCategories.forEach(function(category, i){
        if(i != index){
          category.isActive = false;
          category.Childs.forEach(function (subcategory){
            subcategory.isActive = false;
          });
        }
      });

      vm.menuCategories[index].isActive = !vm.menuCategories[index].isActive;
    }

    function toggleMenuSubCategory(index, category){
      category.Childs.forEach(function(subcategory, i){
        if(i != index){
          subcategory.isActive = false;
        }
      });
      category.isActive = !category.isActive;
    }

    function init(){
      vm.token = localStorageService.get('token');
      vm.user = localStorageService.get('user');
      $rootScope.user = vm.user;
      for(var i=0;i<9;i++){
        vm.pointersSidenav.push({selected:false});
      }
      vm.isLoadingCategoriesTree = true;
      categoriesService.createCategoriesTree().then(function(res){
        vm.isLoadingCategoriesTree = false;
        vm.categoriesTree = res.data;
        $rootScope.categoriesTree = res.data;
        $rootScope.$broadcast('loadedCategoriesTree', res.data);
        var auxCategoryTree = angular.copy(vm.categoriesTree);

        vm.menuCategories = [];
        vm.menuCategories.push( _.findWhere( auxCategoryTree, {Handle: 'muebles'} ) );
        vm.menuCategories.push( angular.copy(_.findWhere( vm.menuCategories[0].Childs, {Handle:'muebles-para-oficina'} ) ) );
        vm.menuCategories.push( angular.copy(_.findWhere( vm.menuCategories[0].Childs, {Handle:'muebles-de-jardin'} ) ) );
        vm.menuCategories.push( _.findWhere(auxCategoryTree, {Handle: 'ninos'} ) );
        vm.menuCategories.push( _.findWhere(auxCategoryTree, {Handle: 'bebes'}  ) );
        vm.menuCategories.push( _.findWhere(auxCategoryTree, {Handle: 'ambientes'} ) );
        vm.menuCategories.push( _.findWhere(auxCategoryTree, {Handle: 'ofertas'}  ) );

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
      quotationService.getActiveQuotation().then(function(res){
        $rootScope.activeQuotation = res.data;
        vm.activeQuotation = res.data;
        if($rootScope.activeQuotation){
          quotationService.getQuotationProducts(vm.activeQuotation).then(function(details){
            $rootScope.activeQuotation.Details = details;
            vm.activeQuotation.Details = details;
            vm.activeQuotation.totalItems = quotationService.calculateItemsNumber(details);
            vm.activeQuotation.total = quotationService.calculateTotal(details);
          });
        }
      });
    }

    function validateUser(){
      var _token = localStorageService.get('token') || false;
      var _user = localStorageService.get('user') || false;

      //Check if token is expired
      if(_token){
          var expiration = jwtHelper.getTokenExpirationDate(_token);
          console.log(expiration);
          if(expiration <= new Date()){
            console.log('expirado');
            authService.logout(function(){
              if($location.path() != '/'){
                $location.path('/');
              }
            });
          }else{
            userService.getUser(_user.id).then(function(res){
              _user = res.data.data;
              localStorageService.set('user', _user);
              $rootScope.user = _user;
            });
          }
      }else{
        console.log('no hay token');
        $location.path('/');
      }

    }

    $scope.$on('$routeChangeStart', function(next, current) {
      vm.menuCategoriesOn = false;
      vm.validateUser();
      vm.menuCategories.forEach(function(category){
        category.isActive = false;
      });
      vm.activeModule = vm.getActiveModule();
    });

    function getActiveModule(){
      var activeModule = false;
      var path = $location.path();
      if(path.indexOf('dashboard') >= 0){
        activeModule = 'dashboard';
      }else if(path.indexOf('addquotation') >= 0){
        activeModule = 'addquotation';
      }else if(path.indexOf('clients') >= 0){
        activeModule = 'clients';
      }else if(path.indexOf('quotations') >= 0){
        activeModule = 'quotations';
      }else if(path.indexOf('orders') >= 0){
        activeModule = 'orders';
      }else if(path.indexOf('commissions') >= 0){
        activeModule = 'commissions';
      }else if(path.indexOf('scorecard') >= 0){
        activeModule = 'scorecard';
      }
      return activeModule;
    }

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
        vm.toggleProfileHeader = false;
        vm.isActiveCart = false;
      }
    }

    function toggleProfileModal(){
      if(vm.toggleProfileHeader){
        vm.toggleProfileHeader = false;
        vm.isActiveBackdrop = false;
      }else{
        vm.toggleProfileHeader = true
        vm.isActiveBackdrop = true;
        vm.isActiveCart = false;
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

    function toggleCartModal(){
      if(vm.isActiveCart){
        vm.isActiveCart = false;
        vm.isActiveBackdrop = false;
      }else{
        vm.isActiveCart = true;
        vm.isActiveBackdrop = true;
        vm.toggleProfileHeader = false;
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
    'cartService',
    'productService',
    'categoriesService',
    'quotationService',
    'jwtHelper',
    'localStorageService',
    'userService'
  ];

})();


