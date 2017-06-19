(function (){
  'use strict';

  angular
    .module('dashexampleApp')
    .factory('categoriesService', categoriesService);

  function categoriesService(api, $q){
    var service = {
      getCategoriesGroups: getCategoriesGroups,
      createCategoriesTree: createCategoriesTree,
      getCategoryByHandle: getCategoryByHandle,
      getCategoryIcon: getCategoryIcon,
      getLowestCategory: getLowestCategory
    };

    function getCategoriesGroups(){
      var url = '/productcategory/getcategoriesgroups';
      return api.$http.post(url);
    }

    function createCategoriesTree(){
      var url = '/productcategory/getcategoriestree';
      return api.$http.post(url);
    }


    function getCategoryByHandle(handle){
      var url = '/productcategory/findbyhandle/' + handle;
      return api.$http.post(url);
    }

    function getCategoryIcon(handle){
      var icons = {
        'ambientes': 'ambientes',
        'colchones': 'colchones',
        'mesas': 'mesas',
        'sillas': 'sillas',
        'bebes': 'bebes',
        'ninos': 'ninos',
        'blancos': 'blancos',
        'decoracion': 'decoracion',
      }
      if(icons[handle]){
        return icons[handle];
      }
      return 'murbles';

    }

    function getLowestCategory(categories){
      var lowestCategoryLevel = 0;
      var lowestCategory = false;
      categories.forEach(function(category){
        if(category.CategoryLevel > lowestCategoryLevel){
          lowestCategory = category;
          lowestCategoryLevel = category.CategoryLevel;
        }
      });
      return lowestCategory;
    }

    var backgrounds = [
      {key:'muebles', src:'/images/categories/muebles.jpg'},
      {key:'mesas', src:'/images/categories/mesas.jpg'},
      {key:'colchones', src:'/images/categories/colchones.jpg'},
      {key:'ninos', src:'/images/categories/ninos.jpg'},
      {key:'bebes', src:'/images/categories/bebes.jpg'},
      {key:'ambientes', src:'/images/categories/ambientes.jpg'},
      {key:'sillas', src:'/images/categories/sillas.jpg'},
      {key:'decoracion', src:'/images/categories/decoracion.jpg'},
      {key:'blancos', src:'/images/categories/blancos.jpg'},
      {key:'ofertas', src:'/images/categories/ofertas.jpg'}
    ];

    return service;
  }

})();
