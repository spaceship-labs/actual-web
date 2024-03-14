'use strict';

angular.module('actualWebApp')
  .controller('MenuCtrl', ['$scope', function ($scope) {
    const header = document.getElementById('header-studio');
    const nav = document.getElementById('header-studio-nav');
    const subnav = document.getElementById('header-studio-nav-2');
    const logoColor = document.getElementById('logo-color');
    const logoWhite = document.getElementById('logo-white');
    const linksNavbar = document.querySelectorAll('.link-navbar');
    const userIcon = document.getElementById("icon-user-navbar");
    const cartIcon = document.getElementById("icon-cart-navbar");
    const businessB = document.getElementById("business-button")

    angular.element(document).ready(function () {
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
        logoColor.style.display = "block";
        logoWhite.style.display = "none";
        for (const link of linksNavbar) {
          link.style.color = 'black';
        }
        for (const link of document.querySelectorAll(".dropdown-mobile")) {
          link.style.color = 'black';
        }

        document.getElementById("lupa-icon").style.color = "black";
        document.getElementById("icon-user-navbar").style.color = "black";
        document.getElementById("icon-cart-navbar").style.color = "black";
        document.getElementById("main-content").style.marginTop = "125px";
        businessB.classList.add("ac-b-b-b");
      } else {
        businessB.classList.add("ac-b-b-w");
      }
    });
    angular.element(window).on('scroll', function () {

      if (window.pageYOffset === 0 && window.location.pathname === '/') { // Hacer algo si el usuario ha hecho scroll hacia abajo
        console.log('El usuario está en la parte superior de la página');
        businessB.classList.remove("ac-b-b-b");
        businessB.classList.add("ac-b-b-w");
        header.style.top = "30px";
        nav.style.top = "105px";
        subnav.style.top = "130px";
        header.style.backgroundColor = 'transparent';
        nav.style.backgroundColor = "transparent";
        subnav.style.backgroundColor = "transparent";
        logoColor.style.display = "none";
        logoWhite.style.display = "block";
        for (const link of linksNavbar) {
          link.style.color = 'white';
        }
        for (const link of document.querySelectorAll(".dropdown-mobile")) {
          link.style.color = 'white';
        }
        document.getElementById("lupa-icon").style.color = "white";
        document.getElementById("icon-user-navbar").style.color = "white";
        document.getElementById("icon-cart-navbar").style.color = "white";
      } else {
        console.log('El usuario ha hecho scroll hacia abajo');
        businessB.classList.add("ac-b-b-b");
        businessB.classList.remove("ac-b-b-w");
        header.style.backgroundColor = "white";
        header.style.top = "0";
        nav.style.top = "75px";
        subnav.style.top = "100px";
        nav.style.backgroundColor = "white";
        subnav.style.backgroundColor = "white";
        subnav.style.boxShadow = '0 5px 5px rgba(0, 0, 0, 0.2)';
        logoColor.style.display = "block";
        logoWhite.style.display = "none";

        for (const link of linksNavbar) {
          link.style.color = 'black';
        }
        for (const link of document.querySelectorAll(".dropdown-mobile")) {
          link.style.color = 'black';
        }
        document.getElementById("lupa-icon").style.color = "black";
        document.getElementById("icon-user-navbar").style.color = "black";
        document.getElementById("icon-cart-navbar").style.color = "black";
      }
    });
  }]);