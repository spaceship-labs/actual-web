(function(){

  'use strict';

  /**
   * @ngdoc function
   * @name dashexampleApp.controller:MainCtrl
   * @description
   * # MainCtrl
   * Controller of the dashexampleApp
   */
  function MainCtrl($rootScope, $scope, $location, $localStorage, $q, $timeout, AuthService){

    console.log($localStorage);

    function successAuth(res){
      console.log(res);
      $localStorage.token = res.token;
      $localStorage.user = res.user;

      $scope.token = $localStorage.token;
      $scope.user = $localStorage.user;

      $location.path('/home');
    }

    function successRegister(res){
      console.log(res);
      $localStorage.token = res.data.token;
      $localStorage.user = res.data.user;

      $scope.token = $localStorage.token;
      $scope.user = $localStorage.user;
      $location.path('/home');

    }

    $scope.loginData = {};
    $scope.registerData = {};

    $scope.signIn = function(){
      var formData = {
        email: $scope.loginData.email,
        password: $scope.loginData.password
      };

      AuthService.signIn(formData, successAuth, function(){
        $rootScope.error = 'Invalid credentials';
      });
    };

    $scope.signUp = function(){
      var formData = {
        email: $scope.registerData.email,
        password: $scope.registerData.password
      };

      AuthService.signUp(formData, successRegister, function(){
        $rootScope.error = 'Invalid credentials';
      });
    };

    $scope.logout = function () {
      AuthService.logout(function () {
        $location.path('/');
      });
    };

    $scope.token = $localStorage.token;
    $scope.user = $localStorage.user;
    console.log($scope.user);
    //$scope.tokenClaims = AuthService.getTokenClaims();


    /*------------*/
      //TEMPORAL FOR CHIP
    /*------------*/
    $scope.searchParams = [];


    /*-------------*/
    //  TEMPORAL, FOR AUTOCOMPLETE
    /*------------*/

    $scope.states        = loadAll();
    $scope.querySearch   = querySearch;
    $scope.selectedItemChange = selectedItemChange;
    $scope.searchTextChange   = searchTextChange;
    $scope.newState = newState;
    $scope.createFilterFor = createFilterFor;
    function newState(state) {
      alert("Sorry! You'll need to create a Constituion for " + state + " first!");
    }
    // ******************************
    // Internal methods
    // ******************************
    /**
     * Search for states... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch (query) {
      var results = query ? $scope.states.filter( createFilterFor(query) ) : $scope.states,
          deferred;
      if (true) {
        deferred = $q.defer();
        $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
        return deferred.promise;
      } else {
        return results;
      }
    }
    function searchTextChange(text) {
      console.log('Text changed to ' + text);
    }
    function selectedItemChange(item) {
      console.log('Item changed to ' + JSON.stringify(item));
    }
    /**
     * Build `states` list of key/value pairs
     */
    function loadAll() {
      var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware,\
              Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
              Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
              Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
              North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
              South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
              Wisconsin, Wyoming';
      return allStates.split(/, +/g).map( function (state) {
        return {
          value: state.toLowerCase(),
          display: state
        };
      });
    }


    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };
    }

    /*-------------*/


  }

  angular.module('dashexampleApp').controller('MainCtrl', MainCtrl);
  MainCtrl.$inject = ['$rootScope', '$scope', '$location', '$localStorage', '$q','$timeout', 'AuthService'];

})();
