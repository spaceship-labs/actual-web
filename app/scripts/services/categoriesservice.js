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
      getLowestCategory: getLowestCategory,
      getCategoryChildsRelations: getCategoryChildsRelations,
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

    function getCategoryChildsRelations(handle) {
      var url = '/productcategory/childsrelations/' + handle;
      return api.$http.post(url).then(function (res) {
        const relations = (res.data || []).filter(function (relation) {
          return relation.position ? relation : false;
        })
        return relations.sort(function (relationA, relationB) {
          return relationA.position - relationB.position;
        });;
      });
    }

    function formatCategoriesTree(originalTree, activeStoreCode) {
      console.log("TEST: Original Tree", originalTree);
      var sortList = [
        {
          name: 'salas',
          childs: [
            'salas-y-sofas',
            'sofa-cama',
            'futones',
            'sofa-cama',
            'sillones-reclinables',
            'sillones-salas',
            'taburete'
          ]
        },
        {
          name: 'sillas',
          childs: [
            'sillas-para-comedor',
            'bancos',
            'Oficina'
          ]
        },
        {
          name: 'mesas',
          childs: [
            'mesas-laterales-y-centro',
            'mesas-de-comedor',
            'bases-mesas-laterales-cama',
            'juego-comedor'
          ]
        },
        {
          name: 'recamaras',
          childs: [
            'camas',
            'cabeceras',
            'bases-para-cama',
            'comoda',
            'colchones',
            'buro-mesa-lateral'
          ]
        },
        {
          name: 'muebles-de-jardin',
          childs: [
            'salas-exterior',
            'mesas-exterior',
            'sillas-y-bancos',
            'camastro',
            'mesa-de- centro-y-lateral'
          ]
        },
        {
          name: 'decoracion',
          childs: [
            'accesorios',
            'cuadros-y-decoracion-de-pared',
            'espejos',
            'tapetes',
            'cojines',
            'iluminacion'
          ]
        },
        {
          name: 'almacenaje',
          childs: [
            'comodas-y-credenzas', 
            'bufeteros',
            'buros',
            'muebles-para-tv',
            'libreros-y-repisas',
            'escritorios'
          ]
        },
        {
          name: 'bebes-y-ninos',
          childs: [
            'camas-y-literas',
            'cunas-bebes-ninos',
            'habitacion-bebes-ninos',
            'almacenar-bebes-ninos',
            'mesas-y-sillas-bebes-ninos',
            'decorativos-bebes-ninos'
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


      var filteredFeaturedProducts = finalSortedTree.reduce(function (acum, category) {
        getCategoryChildsRelations(category.Handle).then(function (values) {
          if (values.length > 0) {
            category.Childs = values.filter(function (category) {
              return category.child !== undefined && category.child[activeStoreCode] > 0;
            }).map(function (category) {
              return category.child; // return child attribute
            })
          }
        });

        if (category.FeaturedProducts) {
          category.FeaturedProducts = category.FeaturedProducts.filter(function (FeaturedProduct) {
            FeaturedProduct.url = buildProductUrl(FeaturedProduct);
            return FeaturedProduct.Active == "Y" && FeaturedProduct[activeStoreCode] > 0
          }).slice(0, 2)
        }
        acum.push(category)
        return acum;
      }, [])
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
      //console.log('Test getCategoryIcon handle', handle);

      if (icons[handle]) {
        return icons[handle];
      }
      return 'murbles';
    }

    function buildProductUrl(product) {
      product.Name = product.Name || capitalizeFirstLetter(product.ItemName);
      var _name = product.Name.replace(new RegExp(' ', 'g'), '-');
      _name = _name.replace(new RegExp('/', 'g'), '-');
      _name = _name.toLowerCase();
      var slug = encodeURIComponent(_name);
      var url = '/' + slug + '/' + product.ItemCode;
      return url;
    }
    function capitalizeFirstLetter(string) {
      var text = string.toLowerCase();
      return text.charAt(0).toUpperCase() + text.slice(1);
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
