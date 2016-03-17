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
    'slick'
  ])

  .constant('urls', {
       BASE: 'http://localhost:1337',
       BASE_API: 'http://api.jwt.dev:8000/v1'
  })

  .config(function ($routeProvider, $httpProvider, $locationProvider) {

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
      /*
      .when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        controllerAs: 'home'
      })*/
      .otherwise({
        redirectTo: '/'
      });

    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function ($q, $location, $localStorage) {
      return {
        request: function (config) {
          config.headers = config.headers || {};
          if ($localStorage.token) {
            config.headers.Authorization = 'JWT ' + $localStorage.token;
          }
          return config;
        },
        responseError: function (response) {
          if (response.status === 401 || response.status === 403) {
            $location.path('/signin');
          }
          return $q.reject(response);
        }
      };
    }]);

  });
