'use strict';

angular.module('actualWebApp')
.controller('MenuCtrl', ['$scope', function($scope) {

  angular.element(window).on('scroll', function() {
    const header = document.getElementById('header-studio');
    const nav = document.getElementById('header-studio-nav');
    const subnav = document.getElementById('header-studio-nav-2');
    const logoBlack = document.getElementById('logo-black');
    const logoWhite = document.getElementById('logo-white');
    const linksNavbar = document.querySelectorAll('.link-navbar');
    if (window.pageYOffset > 0) { // Hacer algo si el usuario ha hecho scroll hacia abajo

      console.log('El usuario ha hecho scroll hacia abajo');
      header.style.backgroundColor = "white";
      header.style.top = "0";
      nav.style.top = "75px";
      subnav.style.top = "100px";
      nav.style.backgroundColor = "white";
      subnav.style.backgroundColor = "white";
      // logoBlack.style.display = "block";
      logoWhite.style.filter = "contrast(0)";
      for (const link of linksNavbar) {
        link.style.color = 'black';
      }
    } else {

      console.log('El usuario está en la parte superior de la página');
      header.style.top = "30px";
      nav.style.top = "105px";
      subnav.style.top = "130px";
      header.style.backgroundColor = 'transparent';
      nav.style.backgroundColor = "transparent";
      subnav.style.backgroundColor = "transparent";
      // logoWhite.style.display = "block";
      logoWhite.style.filter = "contrast(1)";
      for (const link of linksNavbar) {
        link.style.color = 'white';
      }
    }
  });
}]);