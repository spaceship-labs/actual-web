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
    'angular-jwt'
  ])

  .config(function ($routeProvider, $httpProvider, $locationProvider, $mdThemingProvider, localStorageServiceProvider) {

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
      .when('/category', {
        templateUrl: 'views/category.html',
        controller: 'CategoryCtrl',
        controllerAs: 'vm'
      })
      .when('/listing', {
        templateUrl: 'views/listing.html',
        controller: 'ListingCtrl',
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
        responseError: function (response) {
          if (response.status === 401 || response.status === 403) {
            $location.path('/');
          }
          return $q.reject(response);
        }
      };
    }]);

  })



  .run(function(localStorageService, authService, jwtHelper, $location, $rootScope, $route){

      var _token = localStorageService.get('token') || false;
      var _user = localStorageService.get('user') || false;

      //Check if token is expired
      if(_token){
          var expiration = jwtHelper.getTokenExpirationDate(_token);
          console.log(expiration);
          if(expiration <= new Date()){
            console.log('expirado');
            authService.logout(function(){
              $location.path('/');
            });
          }else{
            console.log('no expirado');
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
