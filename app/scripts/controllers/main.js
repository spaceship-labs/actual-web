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
    localStorageService,
    userService,
    siteService,
    storeService,
    $mdDialog,
    dialogService,
    deliveryService,
    commonService,
    ENV,
    SITE
  ){
    var vm = this;
    angular.extend(vm, {
      cart: {},
      activeStore: {},
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
      removeCurrentQuotation: removeCurrentQuotation,
      signIn: signIn,
      toggleCartModal: toggleCartModal,
      toggleLoginModal: toggleLoginModal,
      toggleMenuCategory: toggleMenuCategory,
      togglePointerSidenav: togglePointerSidenav,
      toggleProfileModal: toggleProfileModal,
      getStores: getStores,
      saveBroker: saveBroker,
      saveSource: saveSource,
      adminUrl: ENV.adminUrl,
      siteTheme: SITE.name
    });
    $rootScope.loadActiveQuotation = loadActiveQuotation;

    init();

    function init(){
      vm.token = localStorageService.get('token');
      vm.user = localStorageService.get('user');
      vm.activeStoreId = localStorageService.get('activeStore');
      $rootScope.user = vm.user;
      if ($location.search().itemcode) {
        vm.searchingItemCode = true;
      }
      buildPointersSidenav();
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

      moment.locale('es');

      $(document).click(function(e){
        var $target = $(event.target);
        var profileHeader = $('#profile-header');
        var profileHeaderTrigger = $('#profile-header-trigger');
        var loginHeader = $('#login-header');
        var loginHeaderTrigger = $('#login-header-trigger');

        if(
          !$target.is(profileHeader) && !$target.is(profileHeaderTrigger) &&
          !profileHeaderTrigger.find($target).length && vm.isActiveProfileHeader
        ){
          toggleProfileModal();
        }
        else if(
          !$target.is(loginHeader) && !$target.is(loginHeaderTrigger) &&
          !loginHeaderTrigger.find($target).length && vm.isActiveLogin
        ){
          toggleLoginModal();
        }
        $scope.$apply();
      });

    }

    function buildPointersSidenav(){
      for (var i = 0; i < 9; i++) {
        vm.pointersSidenav.push({selected:false});
      }
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
      /*
      angular.element('body')[0].style = '';
      if(angular.element('.md-scroll-mask')[0]){
          angular.element('.md-scroll-mask')[0].remove();
      }

      if(angular.element('md-dialog')){
        angular.element('md-dialog').remove();
      }

      if(angular.element('.md-dialog-container')[0]){
        angular.element('.md-dialog-container')[0].remove();
      }
      */

      if($rootScope.user){
        //loadMainData();
      }
    });

    function loadMainData(){
      $rootScope.isMainDataLoaded = false;
      $q.all([
        loadActiveQuotation(),
        loadActiveStore(),
        loadSiteInfo()
      ])
      .then(function(data){
        var mainData = {
          activeQuotation: data[0],
          activeStore: data[1],
          site: data[2]
        };
        $rootScope.$emit('mainDataLoaded', mainData);
        $rootScope.isMainDataLoaded = true;
      })
      .catch(function(err){
        console.log('err', err);
      });
    }

    function loadActiveStore() {
      var deferred = $q.defer();
      userService.getActiveStore()
        .then(function(activeStore) {
          vm.activeStore = activeStore;
          $rootScope.activeStore = activeStore;
          //$rootScope.$emit('activeStoreAssigned', activeStore);
          deferred.resolve(activeStore);
        })
        .catch(function(err){
          console.log(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }


    function loadActiveQuotation(){
      var deferred = $q.defer();
      quotationService.getActiveQuotation()
        .then(function(res){
          var quotation = res.data;
          if(quotation && quotation.id){
            quotationService.populateDetailsWithProducts(quotation)
              .then(function(details){
                quotation.Details = details;
                quotation.DetailsGroups = deliveryService.groupDetails(details);
                vm.activeQuotation = quotation;
                $rootScope.activeQuotation = quotation;
                $rootScope.$emit('activeQuotationAssigned', vm.activeQuotation);
                deferred.resolve(vm.activeQuotation);
              })
              .catch(function(err){
                console.log(err);
                deferred.reject(err);
              });
          }else{
            vm.activeQuotation = false;
            $rootScope.activeQuotation = false;
            deferred.resolve(false);
          }
        });
      return deferred.promise;
    }

    function loadBrokers() {
      var deferred = $q.defer();
      userService.getBrokers()
        .then(function(brokers) {
          vm.brokers = brokers;
          $rootScope.brokers = brokers;
          deferred.resolve(brokers);
        })
        .catch(function(err){
          console.log(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function loadSiteInfo(){
      var deferred = $q.defer();
      siteService.findByHandle('actual-group')
        .then(function(res){
          vm.site = res.data || {};
          $rootScope.site = res.data || {};
          deferred.resolve(vm.site);
        })
        .catch(function(err){
          console.log(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    $rootScope.$on('newActiveQuotation', function(ev, newQuotationId){
      loadActiveQuotation();
    });

    function removeCurrentQuotation(){
      quotationService.removeCurrentQuotation();
    }

    function togglePointerSidenav(){
      $mdSidenav('right').toggle();
      if($mdSidenav('right').isOpen() && !vm.brokers){
        loadBrokers();
      }
    }

    function getCategoryIcon(handle){
      return categoriesService.getCategoryIcon(handle);
    }

    //$rootScope.$on("$locationChangeStart",function(event, next, current){
    $scope.$on('$routeChangeStart', function(event, next, current) {
      
      if(current){
        authService.runPolicies();
      }

      loadMainData();
      vm.menuCategoriesOn = false;
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
      var policiesPaths = [
        '/politicas-de-entrega',
        '/politicas-de-garantia',
        '/politicas-de-almacenaje',
        '/politicas-de-instalacion-y-ensamble',
      ];
      var manualsPaths = [
        '/manual-de-cuidados-y-recomendaciones/pieles',
        '/manual-de-cuidados-y-recomendaciones/aceros',
        '/manual-de-cuidados-y-recomendaciones/aluminios',
        '/manual-de-cuidados-y-recomendaciones/cristales',
        '/manual-de-cuidados-y-recomendaciones/cromados',
        '/manual-de-cuidados-y-recomendaciones',
        '/manual-de-cuidados-y-recomendaciones/maderas',
        '/manual-de-cuidados-y-recomendaciones/piezas-plasticas',
        '/manual-de-cuidados-y-recomendaciones/textiles',
        '/manual-de-cuidados-y-recomendaciones/viniles',
        '/manual-de-cuidados-y-recomendaciones/vinilos',
        '/manual-de-cuidados-y-recomendaciones/pintura-electrostatica'
      ];
      if(path.indexOf('dashboard') >= 0){
        activeModule = 'dashboard';
      }
      else if(path.indexOf('addquotation') >= 0){
        activeModule = 'addquotation';
      }
      else if(path.indexOf('clients') >= 0){
        activeModule = 'clients';
      }
      else if(path.indexOf('quotations') >= 0){
        activeModule = 'quotations';
      }
      else if(path.indexOf('orders') >= 0){
        activeModule = 'orders';
      }
      else if(path.indexOf('commissions') >= 0){
        activeModule = 'commissions';
      }
      else if(path.indexOf('scorecard') >= 0){
        activeModule = 'scorecard';
      }
      else if(policiesPaths.indexOf(path) > -1){
        activeModule = 'policies';
      }
      else if(manualsPaths.indexOf(path) > -1){
        activeModule = 'manuals';
      }
      return activeModule;
    }


    function toggleLoginModal(){
      if( vm.isActiveLogin ){
        vm.isActiveLogin = false;
        vm.isActiveBackdrop = false;
      }else{
        vm.isActiveLogin = true;
        vm.isActiveBackdrop = true;
        vm.isActiveProfileHeader = false;
        vm.isActiveCart = false;
      }
    }

    function toggleProfileModal(){
      if(vm.isActiveProfileHeader){
        vm.isActiveProfileHeader = false;
        vm.isActiveBackdrop = false;
      }else{
        vm.isActiveProfileHeader = true;
        vm.isActiveBackdrop = true;
        vm.isActiveCart = false;
      }
    }

    function hideProfileModal(){
      vm.isActiveProfileHeader = false;
      vm.isActiveBackdrop = false;
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
        vm.isActiveProfileHeader = false;
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

    function handleSignInError(err){
      vm.isLoadingLogin = false;
      if(err){
        vm.loginErr = 'Datos incorrectos';
        console.log('vm.loginErr', vm.loginErr);
      }
    }

    function signIn(){
      vm.isLoadingLogin = true;
      var formData = {
        email: vm.logInForm.email,
        password: vm.logInForm.password,
        activeStore: vm.logInForm.activeStoreId
      };
      authService.signIn(
        formData, 
        $rootScope.successAuth, 
        handleSignInError
      );
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
      console.log('res.user', res.user);
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

    function saveBroker(broker) {
      localStorageService.set('broker', broker);
      togglePointerSidenav();
    }

    function saveSource(source){
      if(source === 'Broker'){
        quotationService.updateBroker(vm.quotation, {brokerId:vm.activeQuotation.Broker})
          .then(function(res){
            vm.pointersLoading = false;
            togglePointerSidenav();
            dialogService.showDialog('Datos guardados');
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
    'localStorageService',
    'userService',
    'siteService',
    'storeService',
    '$mdDialog',
    'dialogService',
    'deliveryService',
    'commonService',
    'ENV',
    'SITE'
  ];

})();


