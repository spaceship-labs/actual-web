/*window.addEventListener('load', function () {
    alert("It's loaded!")
  })*/
  document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('load', function () {
      const carouselHome = document.getElementById('carouselHome');
      const offersPageCarousel = document.getElementById('offers-page');
      const currentPath = window.location.pathname;
      if (currentPath == '/') {
        carouselHome.style.display = 'block';
        offersPageCarousel.style.display = 'none';
      } else if (currentPath == '/ofertas') {
        carouselHome.style.display = 'none';
        offersPageCarousel.style.display = 'block';
      }
    })  
});

