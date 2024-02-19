'use strict';

angular.module('actualWebApp')
  .controller('OfertasCtrl', ['$scope', '$location', function($scope, $location) {
       // Función para verificar si la URL es igual a '/ofertas'
       $scope.isOfertasPage = function() {
           return $location.path() === '/ofertas';
       };
   }]);