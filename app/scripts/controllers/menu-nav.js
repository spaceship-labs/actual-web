'use strict';

angular.module('actualWebApp')
.controller('MenuCtrl', ['$scope', function($scope) {
  const header = document.getElementById('header-studio');
  const nav = document.getElementById('header-studio-nav');
  const subnav = document.getElementById('header-studio-nav-2');
  const logoBlack = document.getElementById('logo-black');
  const logoWhite = document.getElementById('logo-white');
  const linksNavbar = document.querySelectorAll('.link-navbar');
  const userIcon = document.getElementById("icon-user-navbar");
  const cartIcon = document.getElementById("icon-cart-navbar");
  
  angular.element(document).ready(function() {
  // Carga tu script JavaScript aquí
    if (window.location.pathname !== '/') {
      document.getElementById("main-content").style.marginTop = "125px";
      console.log("no estoy en el home");
      header.style.backgroundColor = "white";
      header.style.top = "0";
      nav.style.top = "75px";
      subnav.style.top = "100px";
      nav.style.backgroundColor = "white";
      subnav.style.backgroundColor = "white";
      subnav.style.boxShadow = '0 5px 5px rgba(0, 0, 0, 0.2)';
      // logoBlack.style.display = "block";
      logoWhite.style.filter = "contrast(0)";
      for (const link of linksNavbar) {
        link.style.color = 'black';
      }
      document.getElementById("lupa-icon").style.color = "black";
      document.getElementById("icon-user-navbar").style.filter = "contrast(0)";
      document.getElementById("icon-cart-navbar").style.filter = "contrast(0)";
    }
  });
  angular.element(window).on('scroll', function() {

    if (window.pageYOffset === 0 && window.location.pathname === '/') { // Hacer algo si el usuario ha hecho scroll hacia abajo
      console.log('El usuario está en la parte superior de la página');
      header.style.top = "30px";
      nav.style.top = "105px";
      subnav.style.top = "130px";
      header.style.backgroundColor = 'transparent';
      nav.style.backgroundColor = "transparent";
      subnav.style.backgroundColor = "transparent";
      logoWhite.style.filter = "contrast(1)";
      for (const link of linksNavbar) {
        link.style.color = 'white';
      }
      document.getElementById("lupa-icon").style.color = "white";
      document.getElementById("icon-user-navbar").style.filter = "contrast(1)";
      document.getElementById("icon-cart-navbar").style.filter = "contrast(1)";
    } else {
      console.log('El usuario ha hecho scroll hacia abajo');
      header.style.backgroundColor = "white";
      header.style.top = "0";
      nav.style.top = "75px";
      subnav.style.top = "100px";
      nav.style.backgroundColor = "white";
      subnav.style.backgroundColor = "white";
      subnav.style.boxShadow = '0 5px 5px rgba(0, 0, 0, 0.2)';
      logoWhite.style.filter = "contrast(0)";
      
      for (const link of linksNavbar) {
        link.style.color = 'black';
      }
      document.getElementById("lupa-icon").style.color = "black";
      document.getElementById("icon-user-navbar").style.filter = "contrast(0)";
      document.getElementById("icon-cart-navbar").style.filter = "contrast(0)";
    }
  });
}]);