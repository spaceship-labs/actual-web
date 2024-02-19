/*window.addEventListener('load', function () {
    alert("It's loaded!")
  })*/
  document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('load', function () {
      const carouselHome = document.getElementById('carouselHome');
      const offersPageCarousel = document.querySelectorAll(".offers-page");
      const currentPath = window.location.pathname;
      if (currentPath == '/') {
        carouselHome.style.display = 'block';
        for (var oferta of offersPageCarousel) {
          oferta.style.display = "none"; // Oculta los elementos
        }
      } else if (currentPath == '/ofertas') {
        carouselHome.style.display = 'none';
        for (var oferta of offersPageCarousel) {
          oferta.style.display = "block"; // Oculta los elementos
        }
      }
    })  
});

