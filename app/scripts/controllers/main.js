(function(){

  'use strict';

  /**
   * @ngdoc function
   * @name dashexampleApp.controller:MainCtrl
   * @description
   * # MainCtrl
   * Controller of the dashexampleApp
   */
  function MainCtrl($rootScope, $scope){
    var vm = this;
    vm.menuCategoriesOn = false;
    vm.isActiveBackdrop = false;
    vm.isActiveLogin = false;
    vm.isActiveCart = false;
    vm.cart = {};

    vm.activateLoginModal = activateLoginModal;
    vm.deactivateLoginModal = deactivateLoginModal;

    vm.activateCartModal = activateCartModal;
    vm.deactivateCartModal = deactivateCartModal;

    vm.cart.products = [
      {
        name:'Silla textura red',
        priceBefore: 2399,
        priceNow: 1499,
        image: 'images/chair2.jpg'
      },
      {
        name:'Mesa redonda cedro',
        priceBefore: 2399,
        priceNow: 1499,
        image:
          'images/getMain8-287x287.jpg'
      },
      {
        name:'Sofa blanco 2 plazas',
        priceBefore: 2399,
        priceNow: 1499,
        image:'images/1210-287x287.jpg'
      },
      {
        name:'Mesa 2 piezas',
        priceBefore: 2399,
        priceNow: 1499,
        image: 'images/prodotti-59268-relf13017b0-53eb-44c1-b59a-c8438d55cff7-287x287.jpg',
      },
      {
        name:'Mesa redonda mimbre',
        priceBefore: 2399,
        priceNow: 1499,
        image: 'images/BALOU_daybed-forsite-011-287x287.jpg'
      } ,
      {
        name:'Sofa café 3 plazas',
        priceBefore: 2399,
        priceNow: 1499,
        image:'images/All-one-divano-fisso-schienale-abbattuto-copy-287x287.jpg'
      }
    ];

    vm.init = function(){
    };

    $scope.$on('$routeChangeStart', function(next, current) {
      console.log('$routeChangeStart');
      vm.menuCategoriesOn = false;
    });

    vm.init();

    function activateLoginModal(){
      vm.isActiveLogin = true;
      vm.isActiveBackdrop = true;
    }

    function deactivateLoginModal(){
      vm.isActiveLogin = false;
      vm.isActiveBackdrop = false;
    }

    function activateCartModal(){
      vm.isActiveLogin = true;
      vm.isActiveBackdrop = true;
    }

    function deactivateCartModal(){
      vm.isActiveCart = false;
      vm.isActiveBackdrop = false;
    }

  }

  angular.module('dashexampleApp').controller('MainCtrl', MainCtrl);
  MainCtrl.$inject = ['$rootScope', '$scope'];

})();
