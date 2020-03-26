(function () {
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

    function createCategoriesTree(activeStoreCode) {
      //activeStoreCode = 'actual_studio';
      console.log('createCategoriesTree', activeStoreCode);
      var url = '/productcategory/getcategoriestree';
      return api.$http.post(url).then(function (res) {
        return formatCategoriesTree(res.data, activeStoreCode);
      });
    }

    function formatCategoriesTree(originalTree, activeStoreCode) {
      console.log("TEST: Original Tree", originalTree);
      var sortList = [
        {
          name: 'salas',
          childs: [
            'salas-esquineras',
            'salas-modulares',
            'sofas',
            'sofa-cama',
            'futon',
            'sillones',
            'sillones-reclinables',
            'salas-de-cine',
            'taburete',
            'salas-para-jardin',
            'mesas-de-centro',
            'mesas-laterales',
            'credenzas'
          ]
        },
        {
          name: 'comedores',
          childs: [
            'mesas-de-comedor',
            'sillas-para-comedor',
            'bancos-para-barra',
            'bufeteras'
          ]
        },
        {
          name: 'sillas',
          childs: [
            'sillas-para-comedor',
            'sillas-para-oficina',
            'sillas-para-jardin',
            'bancos-para-barra'
          ]
        },
        {
          name: 'recamaras',
          childs: [
            'camas',
            'cabeceras',
            'bases-para-cama',
            'futon',
            'sofa-cama',
            'comoda',
            'buros',
            'colchones'
          ]
        },
        {
          name: 'muebles-de-jardin',
          childs: [
            'salas-para-jardin',
            'sillones-para-exterior',
            'mesas-para-jardin',
            'sillas-para-jardin',
            'camastro',
            'sombrillas'
          ]
        },
        {
          name: 'muebles-para-oficina',
          childs: ['escritorios', 'sillas-para-oficina', 'libreros']
        },
        {
          name: 'muebles-de-tv',
          childs: [
            'muebles-para-tv',
            'centro-de-entretenimiento',
            'sillones-reclinables',
            'sillones',
            'salas-de-cine'
          ]
        },

        //KIDS
        {
          name: 'camas-literas',
          childs: [
            'camas',
            'literas',
            'cabeceras',
            'bases-de-cama',
            'colchones'
          ]
        },
        {
          name: 'cunas',
          childs: [
            'cunas',
            'colchones-cuna',
            'cojines-cunas',
            'blancos'
          ]
        },
        {
          name: 'habitacion',
          childs: [
            'cambiador',
            'escritorio',
            'mecedoras',
            'bancos',
            'tocador',
            'espejos',
          ]
        },
        {
          name: 'almacenar',
          childs: [
            'buros',
            'comodas',
            'repisas',
            'libreros'
          ]
        }

      ];

      var tree = [];
      if (activeStoreCode === 'actual_kids') {
        tree = originalTree.filter(function (item) {
          return (
            item &&
            item.onKidsMenu &&
            item.Childs &&
            item.Childs.length > 0 &&
            item.Childs.some(function (child) {
              return child[activeStoreCode] > 0;
            })
          );
        });
      } else {
        tree = originalTree.filter(function (item) {
          return (
            item &&
            !item.onKidsMenu &&
            item.Childs &&
            item.Childs.length > 0 &&
            item.Childs.some(function (child) {
              return child[activeStoreCode] > 0;
            })
          );
        });
      }

      var groupsLevel1 = _.groupBy(tree, 'Handle');
      var plainSortList = sortList.map(function (sortItem) {
        return sortItem.name;
      });
      var remaining = tree.filter(function (item) {
        return plainSortList.indexOf(item.Handle) <= -1;
      });

      function filterMenuSubCategories(item) {
        //This is supposed to be activeStoreCode
        return item && item[this] > 0;
      }

      //return;
      var sortedTree = _.map(sortList, function (sortItem) {
        if (groupsLevel1[sortItem.name] && groupsLevel1[sortItem.name][0]) {
          var childsGroups = _.groupBy(
            groupsLevel1[sortItem.name][0].Childs,
            'Handle'
          );
          var childsRemaining = groupsLevel1[sortItem.name][0].Childs.filter(
            function (childItem) {
              return sortItem.childs.indexOf(childItem.Handle) <= -1;
            }
          );
          var childsSorted = sortItem.childs
            .reduce(function (acum, sortChildItem) {
              if (childsGroups[sortChildItem]) {
                acum.push(childsGroups[sortChildItem].shift());
              }
              return acum;
            }, [])
            .concat(childsRemaining);

          groupsLevel1[sortItem.name][0].Childs = childsSorted.filter(
            filterMenuSubCategories,
            activeStoreCode
          );
        }
        if (groupsLevel1[sortItem.name]) {
          return groupsLevel1[sortItem.name][0];
        }
        return null;
      });

      var finalSortedTree = sortedTree.concat(remaining).filter(function (item) {
        return item;
      });

      console.log("FINALSORTEDTREE", finalSortedTree);

      var filteredFeaturedProducts = finalSortedTree.reduce((acum, category) => {
        category.FeaturedProducts = category.FeaturedProducts.filter(FeaturedProduct => {
          console.log("Reducer", FeaturedProduct.Active == "Y" && FeaturedProduct[activeStoreCode] > 0)
          return FeaturedProduct.Active == "Y" && FeaturedProduct[activeStoreCode] > 0
        })
        acum.push(category)
        return acum;
      }, [])
      console.log("FINALFEATUREDFILTER", filteredFeaturedProducts)
      return filteredFeaturedProducts;
    }

    function getCategoryByHandle(handle) {
      var url = '/productcategory/findbyhandle/' + handle;
      return api.$http.post(url);
    }

    function getCategoryIcon(handle) {
      var icons = {
        salas: 'salas',
        comedores: 'comedores',
        sillas: 'sillas',
        recamaras: 'recamaras',
        ambientes: 'decoracion',
        colchones: 'colchones',
        mesas: 'mesas',
        bebes: 'bebes',
        ninos: 'ninos',
        blancos: 'blancos',
        decoracion: 'decoracion',
        'muebles-de-jardin': 'exterior',
        'muebles-para-oficina': 'paraoficina',
        'muebles-de-tv': 'mueblestv',
        tapetes: 'tapetes2',
        'decoracion-de-paredes': 'decoracionpared',
        iluminacion: 'iluminacion',
        organizacion: 'murbles'
      };
      console.log('Test getCategoryIcon handle', handle);

      if (icons[handle]) {
        return icons[handle];
      }
      return 'murbles';
    }

    function getLowestCategory(categories) {
      var lowestCategoryLevel = 0;
      var lowestCategory = false;
      categories.forEach(function (category) {
        if (category.CategoryLevel > lowestCategoryLevel) {
          lowestCategory = category;
          lowestCategoryLevel = category.CategoryLevel;
        }
      });
      return lowestCategory;
    }

    return service;
  }
})();
