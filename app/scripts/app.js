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

  .config(function ($routeProvider, $httpProvider, $locationProvider, localStorageServiceProvider) {

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

  });
