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
      getCategoryIcon: getCategoryIcon
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
        'ambientes': 'ambientes',
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


    return service;
  }

})();
