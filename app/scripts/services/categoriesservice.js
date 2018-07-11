(function() {
  'use strict';

  angular
    .module('actualWebApp')
    .factory('categoriesService', categoriesService);

  function categoriesService(api, $q) {
    var service = {
      getCategoriesGroups: getCategoriesGroups,
      createCategoriesTree: createCategoriesTree,
      getCategoryByHandle: getCategoryByHandle,
      getCategoryIcon: getCategoryIcon,
      getLowestCategory: getLowestCategory
    };

    function getCategoriesGroups() {
      var url = '/productcategory/getcategoriesgroups';
      return api.$http.post(url);
    }

    function createCategoriesTree() {
      var url = '/productcategory/getcategoriestree';
      return api.$http.post(url).then(function(res) {
        return sortCategoriesTree(res.data);
      });
    }

    function sortCategoriesTree(originalTree) {
      var sortList = [
        { name: 'salas' },
        { name: 'comedores' },
        { name: 'sillas' },
        { name: 'recamaras' },
        { name: 'muebles-de-jardin' },
        { name: 'muebles-para-oficina' },
        { name: 'muebles-de-tv' },
        //KIDS
        { name: 'ninos' },
        { name: 'bebes' },
        { name: 'mama-y-papa' },
        { name: 'organizacion-kids' },
        { name: 'juguetes' },
        { name: 'decoracion-infantil' },
        { name: 'lamparas-infantiles' },
        { name: 'tapetes-infantiles' }
      ];

      var groups1 = _.groupBy(originalTree, 'Handle');
      var plainSortList = sortList.map(function(sortItem) {
        return sortItem.name;
      });
      var remaining = originalTree.filter(function(item) {
        return plainSortList.indexOf(item.Handle) <= -1;
      });
      var sortedTree = _.map(sortList, function(sortItem) {
        return groups1[sortItem.name].shift();
      });

      var finalSortedTree = sortedTree.concat(remaining);
      return finalSortedTree;
    }

    function getCategoryByHandle(handle) {
      var url = '/productcategory/findbyhandle/' + handle;
      return api.$http.post(url);
    }

    function getCategoryIcon(handle) {
      var icons = {
        ambientes: 'ambientes',
        colchones: 'colchones',
        mesas: 'mesas',
        sillas: 'sillas',
        bebes: 'bebes',
        ninos: 'ninos',
        blancos: 'blancos',
        decoracion: 'decoracion'
      };
      if (icons[handle]) {
        return icons[handle];
      }
      return 'murbles';
    }

    function getLowestCategory(categories) {
      var lowestCategoryLevel = 0;
      var lowestCategory = false;
      categories.forEach(function(category) {
        if (category.CategoryLevel > lowestCategoryLevel) {
          lowestCategory = category;
          lowestCategoryLevel = category.CategoryLevel;
        }
      });
      return lowestCategory;
    }

    var backgrounds = [
      { key: 'muebles', src: '/images/categories/muebles.jpg' },
      { key: 'mesas', src: '/images/categories/mesas.jpg' },
      { key: 'colchones', src: '/images/categories/colchones.jpg' },
      { key: 'ninos', src: '/images/categories/ninos.jpg' },
      { key: 'bebes', src: '/images/categories/bebes.jpg' },
      { key: 'ambientes', src: '/images/categories/ambientes.jpg' },
      { key: 'sillas', src: '/images/categories/sillas.jpg' },
      { key: 'decoracion', src: '/images/categories/decoracion.jpg' },
      { key: 'blancos', src: '/images/categories/blancos.jpg' },
      { key: 'ofertas', src: '/images/categories/ofertas.jpg' }
    ];

    return service;
  }
})();
