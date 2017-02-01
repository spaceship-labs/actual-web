'use strict';

/**
 * @ngdoc overview
 * @name dashexampleApp
 * @description
 * # dashexampleApp
 *
 * Main module of the application.
 */
angular
  .module('dashexampleApp', [
    'ngAnimate',
    'ngStorage',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngMaterial',
    'slick',
    'LocalStorageModule',
    'angular-jwt',
    'datatables',
    'chart.js',
    'ezplus',
    'pikaday',
    'ui.timepicker',
    'ngFileUpload',
    'sly',
    'infinite-scroll',
    'ngPhotoswipe',
    'ui.utils.masks',
    'leaflet-directive',
    'localytics.directives',
    'ng-currency',
    'envconfig',
    'siteconfig'
  ])

  .config(function (
    $routeProvider,
    $httpProvider,
    $locationProvider,
    $mdThemingProvider,
    localStorageServiceProvider
  ) {


    $mdThemingProvider.theme('default')
      .accentPalette('red', {
        'default': '700' // use shade 200 for default, and keep all other shades the same
      });


    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        controllerAs: 'vm'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'vm'
      })
      .when('/category/:category', {
        templateUrl: 'views/category.html',
        controller: 'CategoryCtrl',
        controllerAs: 'vm'
      })
      .when('/product/:id', {
        templateUrl: 'views/product.html',
        controller: 'ProductCtrl',
        controllerAs: 'vm'
      })
      .when('/search', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl',
        controllerAs: 'vm'
      })
      .when('/addquotation', {
        templateUrl: 'views/addquotation.html',
        controller: 'AddquotationCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope, authService){
            authService.dennyAccessBroker();
            authService.dennyAccessStoreManager();
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/clients/create', {
        templateUrl: 'views/clients/create.html',
        controller: 'ClientCreateCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope){
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/clients/profile/:id', {
        templateUrl: 'views/clients/profile.html',
        controller: 'ClientProfileCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope){
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/clients/list', {
        templateUrl: 'views/clients/list.html',
        controller: 'ClientsListCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope, authService){
            authService.dennyAccessBroker();
            authService.dennyAccessStoreManager();
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/user/profile', {
        templateUrl: 'views/users/profile.html',
        controller: 'UserProfileCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope){
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/cart/:id', {
        templateUrl: 'views/cart.html',
        controller: 'CartCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope){
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/quotations/list', {
        templateUrl: 'views/quotations/list.html',
        controller: 'QuotationsListCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope,authService){
            authService.dennyAccessBroker();
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/quotations/records', {
        templateUrl: 'views/quotations/records.html',
        controller: 'QuotationsRecordsCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope, authService){
            authService.dennyAccessBroker();
            authService.dennyAccessStoreManager();
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/quotations/edit/:id', {
        templateUrl: 'views/quotations/edit.html',
        controller: 'QuotationsEditCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope){
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/dashboard', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope, authService){
            authService.dennyAccessBroker();
            authService.dennyAccessStoreManager();
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/checkout/client/:id', {
        templateUrl: 'views/checkout/client.html',
        controller: 'CheckoutClientCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope, authService){
            authService.dennyAccessBroker();
            authService.dennyAccessStoreManager();
            $rootScope.isMiActual = true;
            return true;
          }
        }

      })
      .when('/checkout/paymentmethod/:id', {
        templateUrl: 'views/checkout/payments.html',
        controller: 'CheckoutPaymentsCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope, authService){
            authService.dennyAccessBroker();
            authService.dennyAccessStoreManager();
            $rootScope.isMiActual = true;
            return true;
          }
        }

      })
      .when('/continuequotation', {
        templateUrl: 'views/continuequotation.html',
        controller: 'ContinuequotationCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope, authService){
            authService.dennyAccessBroker();
            authService.dennyAccessStoreManager();
            $rootScope.isMiActual = true;
            return true;
          }
        }

      })
      .when('/commissions/list', {
        templateUrl: 'views/commissions/list.html',
        controller: 'CommissionsListCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope){
            $rootScope.isMiActual = true;
            return true;
          }
        }

      })
      .when('/orders/list', {
        templateUrl: 'views/orders/list.html',
        controller: 'OrdersListCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope){
            $rootScope.isMiActual = true;
            return true;
          }
        }

      })
      .when('/checkout/order/:id', {
        templateUrl: 'views/checkout/order.html',
        controller: 'CheckoutOrderCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope){
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/refunds/:id', {
        templateUrl: 'views/refunds.html',
        controller: 'CheckoutRefundsCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope){
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/users/brokerprofile', {
        templateUrl: 'views/users/broker.html',
        controller: 'UsersBrokerCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope){
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/ofertas', {
        templateUrl: 'views/offers.html',
        controller: 'OffersCtrl',
        controllerAs: 'vm',
        resolve: {
          isMiActual: function($rootScope){
            $rootScope.isMiActual = true;
            return true;
          }
        }
      })
      .when('/refunds/products/:id', {
        templateUrl: 'views/refunds/products.html',
        controller: 'RefundsProductsCtrl',
        controllerAs: 'vm'
      })
      .when('/refunds/payments/:id', {
        templateUrl: 'views/refunds/payments.html',
        controller: 'RefundsPaymentsCtrl',
        controllerAs: 'vm'
      })
      .when('/politicas-de-entrega', {
        templateUrl: 'views/delivery-policy.html',
        controller: 'DeliveryPolicyCtrl',
        controllerAs: 'deliveryPolicy'
      })
      .when('/politicas-de-instalacion-y-ensamble', {
        templateUrl: 'views/ensamble-policy.html',
        controller: 'EnsamblePolicyCtrl',
        controllerAs: 'ensamblePolicy'
      })
      .when('/politicas-de-almacenaje', {
        templateUrl: 'views/storage-policy.html',
        controller: 'StoragePolicyCtrl',
        controllerAs: 'storagePolicy'
      })
      .when('/politicas-de-garantia', {
        templateUrl: 'views/warranty-policy.html',
        controller: 'WarrantyPolicyCtrl',
        controllerAs: 'warrantyPolicy'
      })
      .when('/user/user-deliveries', {
        templateUrl: 'views/users/user-deliveries.html',
        controller: 'UsersUserDeliveriesCtrl',
        controllerAs: 'users/userDeliveries'
      })
      .when('/user/user-invoices', {
        templateUrl: 'views/users/user-invoices.html',
        controller: 'UsersUserInvoicesCtrl',
        controllerAs: 'users/userInvoices'
      })
      .when('/user/user-payments', {
        templateUrl: 'views/users/user-payments.html',
        controller: 'UsersUserPaymentsCtrl',
        controllerAs: 'users/userPayments'
      })
      .when('/user/user-purse', {
        templateUrl: 'views/users/user-purse.html',
        controller: 'UsersUserPurseCtrl',
        controllerAs: 'users/userPurse'
      })
      .when('/user/user-purchases', {
        templateUrl: 'views/users/user-purchases.html',
        controller: 'UsersUserPurchasesCtrl',
        controllerAs: 'users/userPurchases'
      })
      .when('/checkout/payment-info', {
        templateUrl: 'views/checkout/payment-info.html',
        controller: 'CheckoutPaymentInfoCtrl',
        controllerAs: 'checkout/paymentInfo'
      })
      .when('/envio-y-entrega', {
        templateUrl: 'views/shippinganddelivery.html',
        controller: 'ShippinganddeliveryCtrl',
        controllerAs: 'shippinganddelivery'
      })
      .when('/cambios-devoluciones-y-cancelaciones', {
        templateUrl: 'views/refundstext.html',
        controller: 'RefundstextCtrl',
        controllerAs: 'refundstext'
      })
      .when('/manual-de-cuidados-y-recomendaciones/pieles', {
        templateUrl: 'views/manual/pieles.html',
        controller: 'ManualPielesCtrl',
        controllerAs: 'manual/pieles'
      })
      .when('/manual-de-cuidados-y-recomendaciones/aceros', {
        templateUrl: 'views/manual/aceros.html',
        controller: 'ManualAcerosCtrl',
        controllerAs: 'manual/aceros'
      })
      .when('/manual-de-cuidados-y-recomendaciones/aluminios', {
        templateUrl: 'views/manual/aluminios.html',
        controller: 'ManualAluminiosCtrl',
        controllerAs: 'manual/aluminios'
      })
      .when('/manual-de-cuidados-y-recomendaciones/cristales', {
        templateUrl: 'views/manual/cristales.html',
        controller: 'ManualCristalesCtrl',
        controllerAs: 'manual/cristales'
      })
      .when('/manual-de-cuidados-y-recomendaciones/cromados', {
        templateUrl: 'views/manual/cromados.html',
        controller: 'ManualCromadosCtrl',
        controllerAs: 'manual/cromados'
      })
      .when('/manual-de-cuidados-y-recomendaciones', {
        templateUrl: 'views/manual.html',
        controller: 'ManualCtrl',
        controllerAs: 'manual'
      })
      .when('/manual-de-cuidados-y-recomendaciones/maderas', {
        templateUrl: 'views/manual/maderas.html',
        controller: 'ManualMaderasCtrl',
        controllerAs: 'manual/maderas'
      })
      .when('/manual-de-cuidados-y-recomendaciones/piezas-plasticas', {
        templateUrl: 'views/manual/piezas-plasticas.html',
        controller: 'ManualPiezasPlasticasCtrl',
        controllerAs: 'manual/piezasPlasticas'
      })
      .when('/manual-de-cuidados-y-recomendaciones/textiles', {
        templateUrl: 'views/manual/textiles.html',
        controller: 'ManualTextilesCtrl',
        controllerAs: 'manual/textiles'
      })
      .when('/manual-de-cuidados-y-recomendaciones/viniles', {
        templateUrl: 'views/manual/viniles.html',
        controller: 'ManualVinilesCtrl',
        controllerAs: 'manual/viniles'
      })
      .when('/manual-de-cuidados-y-recomendaciones/vinilos', {
        templateUrl: 'views/manual/vinilos.html',
        controller: 'ManualVinilosCtrl',
        controllerAs: 'manual/vinilos'
      })
      .when('/manual-de-cuidados-y-recomendaciones/pintura-electrostatica', {
        templateUrl: 'views/manual/pintura-electrostatica.html',
        controller: 'ManualPinturaElectrostaticaCtrl',
        controllerAs: 'manual/pinturaElectrostatica'
      })      
      .when('/compra-fiable', {
        templateUrl: 'views/securebuy.html',
        controller: 'SecurebuyCtrl',
        controllerAs: 'securebuy'
      })
      .when('/formas-de-pago', {
        templateUrl: 'views/paymentmethods.html',
        controller: 'PaymentmethodsCtrl',
        controllerAs: 'paymentmethods'
      })
      .when('/preguntas-frecuentes', {
        templateUrl: 'views/faq.html',
        controller: 'FaqCtrl',
        controllerAs: 'faq'
      })
      .when('/faq', {
        templateUrl: 'views/faq.html',
        controller: 'FaqCtrl',
        controllerAs: 'faq'
      })
      .when('/quienes-somos', {
        templateUrl: 'views/aboutus.html',
        controller: 'AboutusCtrl',
        controllerAs: 'aboutus'
      })
      .when('/filosofia', {
        templateUrl: 'views/philosophy.html',
        controller: 'PhilosophyCtrl',
        controllerAs: 'philosophy'
      })
      .when('/nuestras-marcas', {
        templateUrl: 'views/ourbrands.html',
        controller: 'OurbrandsCtrl',
        controllerAs: 'ourbrands'
      })
      .when('/nuestras-tiendas', {
        templateUrl: 'views/ourstores.html',
        controller: 'OurstoresCtrl',
        controllerAs: 'ourstores'
      })
      .when('/ourstores', {
        templateUrl: 'views/ourstores.html',
        controller: 'OurstoresCtrl',
        controllerAs: 'ourstores'
      })
      .when('/aviso-de-privacidad', {
        templateUrl: 'views/privacy.html',
        controller: 'PrivacyCtrl',
        controllerAs: 'privacy'
      })
      .otherwise({
        redirectTo: '/'
      });

    localStorageServiceProvider.setPrefix('actualFront');

    //JWT TOKENS CONFIG
    $httpProvider.interceptors.push(['$q', '$location', 'localStorageService', function ($q, $location, localStorageService) {
      return {
        request: function (config) {
          config.headers = config.headers || {};
          if ( localStorageService.get('token') ) {
            config.headers.Authorization = 'JWT ' + localStorageService.get('token');
          }
          return config;
        },
        /*
        responseError: function (response) {
          if (response.status === 401 || response.status === 403) {
            $location.path('/');
          }
          return $q.reject(response);
        }
        */
      };
    }]);

  })



  .run(function(localStorageService, authService, jwtHelper, userService, $location, $rootScope, $route){

      var _token = localStorageService.get('token') || false;
      var _user  = localStorageService.get('user')  || false;

      //Check if token is expired
      if(_token){
          var expiration = jwtHelper.getTokenExpirationDate(_token);
          if(expiration <= new Date()){
            console.log('expirado');
            authService.logout(function(){
              $location.path('/');
            });
          }else{
            userService.getUser(_user.id).then(function(res){
              _user = res.data.data;
              console.log('getting _user');
              console.log(_user);
              localStorageService.set('user', _user);
              $rootScope.user = _user;
            });
          }
      }else{
        console.log('no hay token');
      }

      //Configures $location.path second parameter, for no reloading

      var original = $location.path;
      $location.path = function (path, reload) {
          if (reload === false) {
              var lastRoute = $route.current;
              var un = $rootScope.$on('$locationChangeSuccess', function () {
                  $route.current = lastRoute;
                  un();
              });
          }
          return original.apply($location, [path]);
      };



  });
