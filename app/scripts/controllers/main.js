(function(){

  'use strict';

  /**
   * @ngdoc function
   * @name dashexampleApp.controller:MainCtrl
   * @description
   * # MainCtrl
   * Controller of the dashexampleApp
   */
  function MainCtrl(
    api,
    $mdUtil,
    $rootScope,
    $q,
    $scope,
    $location,
    $window,
    $route,
    $mdSidenav,
    authService,
    cartService,
    productService,
    categoriesService,
    quotationService,
    jwtHelper,
    localStorageService,
    userService,
    siteService,
    storeService,
    $mdDialog,
    dialogService,
    deliveryService,
    commonService
  ){
    var vm = this;
    angular.extend(vm, {
      cart: {},
      isActiveBackdrop: false,
      isActiveCart: false,
      isActiveLogin: false,
      isLoadingLogin: false,
      isMiActual: $rootScope.isMiActual,
      logInForm: {},
      mapTerminalCode: commonService.mapTerminalCode,
      menuCategories: [],
      menuCategoriesOn: false,
      pointersSidenav: [],
      activateCartModal: activateCartModal,
      activateLoginModal: activateLoginModal,
      deactivateCartModal: deactivateCartModal,
      deactivateLoginModal: deactivateLoginModal,
      getActiveModule: getActiveModule,
      getCategoryBackground: getCategoryBackground,
      getCategoryIcon: getCategoryIcon,
      logOut: logOut,
      signIn: signIn,
      toggleCartModal: toggleCartModal,
      toggleLoginModal: toggleLoginModal,
      toggleMenuCategory: toggleMenuCategory,
      togglePointerSidenav: togglePointerSidenav,
      toggleProfileModal: toggleProfileModal,
      getStores: getStores,
      saveBroker: saveBroker,
      saveSource: saveSource
    });
    $rootScope.getActiveQuotation = getActiveQuotation;


    function init(){
      vm.token = localStorageService.get('token');
      vm.user = localStorageService.get('user');
      vm.activeStoreId = localStorageService.get('activeStore');
      vm.activeStoreName = localStorageService.get('activeStoreName');
      $rootScope.user = vm.user;
      if ($location.search().itemcode) {
        vm.searchingItemCode = true;
      }
      buildPointersSidenav();
      getSiteInfo();
      vm.isLoadingCategoriesTree = true;
      categoriesService.createCategoriesTree()
        .then(function(res){
          vm.isLoadingCategoriesTree = false;
          vm.categoriesTree = res.data;
          vm.menuCategories = buildMenuCategories(vm.categoriesTree);
        })
        .catch(function(err){
          console.log(err);
        });

      $scope.$watch(function() {
        return localStorageService.get('quotation');
      }, function(quotation) {
        vm.quotation = quotation;
      });

      if($rootScope.user){
        getActiveStore();
        getBrokers();
        //getActiveQuotation();
      }
    }

    function buildPointersSidenav(){
      for (var i = 0; i < 9; i++) {
        vm.pointersSidenav.push({selected:false});
      }      
    }

    function getSiteInfo(){
      siteService.findByHandle('actual-group')
        .then(function(res){
          vm.site = res.data || {};
          $rootScope.site = res.data || {};
        })
        .catch(function(err){
          console.log(err);
        });
    }

    function buildMenuCategories(categoryTree){
      var menuCategories = [];
      menuCategories.push( _.findWhere( categoryTree, {Handle: 'muebles'} ) );
      menuCategories.push( angular.copy(_.findWhere( menuCategories[0].Childs, {Handle:'muebles-para-oficina'} ) ) );
      menuCategories.push( angular.copy(_.findWhere( menuCategories[0].Childs, {Handle:'muebles-de-jardin'} ) ) );
      menuCategories.push( _.findWhere(categoryTree, {Handle: 'ninos'} ) );
      menuCategories.push( _.findWhere(categoryTree, {Handle: 'bebes'}  ) );
      menuCategories.push( _.findWhere(categoryTree, {Handle: 'ambientes'} ) );
      menuCategories.push( _.findWhere(categoryTree, {Handle: 'ofertas'}  ) );
      return menuCategories;
    }


    function toggleMenuCategory(index){
      vm.menuCategories.forEach(function(category, i){
        if(i !== index){
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
        if(i !== index){
          subcategory.isActive = false;
        }
      });
      category.isActive = !category.isActive;
    }

    $scope.$on("$routeChangeSuccess", function(event, next, current) {
      //Patch for autocomplete which doesn't remove
      //TODO search a better solution
      angular.element('body')[0].style = '';
      if(angular.element('.md-scroll-mask')[0]){
          angular.element('.md-scroll-mask')[0].remove();
      }

      if($rootScope.user){
        getActiveQuotation();
      }      

    });    

    function togglePointerSidenav(){
      $mdSidenav('right').toggle();
    }

    function getCategoryIcon(handle){
      return categoriesService.getCategoryIcon(handle);
    }

    function getActiveQuotation(){
      var deferred = $q.defer();
      quotationService.getActiveQuotation().then(function(res){
        $rootScope.activeQuotation = res.data;
        vm.activeQuotation = res.data;
        if($rootScope.activeQuotation){
          quotationService.populateDetailsWithProducts(vm.activeQuotation)
            .then(function(details){
              $rootScope.activeQuotation.Details = details;
              vm.activeQuotation.Details = details;
              vm.activeQuotation.DetailsGroups = deliveryService.groupDetails(vm.activeQuotation.Details);
              deferred.resolve();
            })
            .catch(function(err){
              console.log(err);
            });
        }
      });
      return deferred.promise;
    }

    function validateUser(){
      var _token = localStorageService.get('token') || false;
      var _user = localStorageService.get('user') || false;

      //Check if token is expired
      if(_token){
          var expiration = jwtHelper.getTokenExpirationDate(_token);
          if(expiration <= new Date()){
            console.log(expiration);
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
              localStorageService.set('activeStore', _user.activeStore);              
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
      validateUser();
      getSiteInfo();
      vm.menuCategories.forEach(function(category){
        category.isActive = false;
      });
      vm.activeModule = vm.getActiveModule();
      if($location.search().itemcode){
        vm.searchingItemCode = true;
      }else{
        vm.searchingItemCode = false;
      }

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

    /*
    $rootScope.$on('newActiveQuotation', function(event, data){
      if($rootScope.user){
        getActiveQuotation();
      }
    });
    */


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
        vm.toggleProfileHeader = true;
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
        password: vm.logInForm.password,
        activeStore: vm.logInForm.activeStoreId
      };
      authService.signIn(formData, $rootScope.successAuth, function(){
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
      vm.token = res.token;
      vm.user  = res.user;
      localStorageService.remove('currentQuotation');
      localStorageService.set('token', res.token);
      localStorageService.set('user' , res.user);
      localStorageService.set('activeStore', res.user.activeStore);
      $window.location.reload();
    };


    function getCategoryBackground(handle){
      var image =  '/images/mesas.jpg';
      image = api.baseUrl + '/categories/' + handle + '.jpg';
      return {'background-image' : 'url(' + image + ')'};
    }

    $scope.$on('$routeChangeStart', function(next, current) {
      vm.menuCategoriesOn = false;
      vm.isActiveBackdrop = false;
      vm.isActiveLogin = false;
      vm.isActiveCart = false;
      vm.isLoadingLogin = false;
    });

    function getStores(email) {
      userService.getStores(email).then(function(stores){
        vm.stores = stores;
        if(vm.stores.length > 0){
          vm.logInForm.activeStoreId = vm.stores[0].id;
        }
      });
    }

    function getActiveStore() {
      userService.getActiveStore().then(function(activeStore) {
        vm.activeStore = activeStore;
        $rootScope.activeStore = activeStore;
        $rootScope.$emit('activeStoreAssigned', activeStore);
      });
    }

    function getBrokers() {
      userService.getBrokers().then(function(brokers) {
        vm.brokers = brokers;
      });
    }

    function saveBroker(broker) {
      localStorageService.set('broker', broker);
      togglePointerSidenav();
    }

    function saveSource(source){
      if(source === 'Broker'){
        console.log('broker',vm.activeQuotation.Broker);
        quotationService.updateBroker(vm.quotation, {brokerId:vm.activeQuotation.Broker})
          .then(function(res){
            vm.pointersLoading = false;
            togglePointerSidenav();
            dialogService.showDialog('Datos guardados');
            console.log(res);
          })
          .catch(function(err){
            vm.pointersLoading = false;
            console.log(err);
            togglePointerSidenav();
            dialogService.showDialog('Hubo un error, revisa tus datos');
          });
      }else{
        if(vm.quotation){
          vm.pointersLoading = true;
          quotationService.updateSource(vm.quotation, {source:source})
            .then(function(res){
              vm.pointersLoading = false;
              togglePointerSidenav();
              dialogService.showDialog('Datos guardados');
              console.log(res);
            })
            .catch(function(err){
              vm.pointersLoading = false;
              console.log(err);
              togglePointerSidenav();
              dialogService.showDialog('Hubo un error, revisa tus datos');
            });
        }
      }
    }

    init();

    //$scope.$on('$destroy', $mdUtil.enableScrolling);

  }

  angular.module('dashexampleApp').controller('MainCtrl', MainCtrl);
  MainCtrl.$inject = [
    'api',
    '$mdUtil',
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
    'userService',
    'siteService',
    'storeService',
    '$mdDialog',
    'dialogService',
    'deliveryService',
    'commonService'
  ];

})();


