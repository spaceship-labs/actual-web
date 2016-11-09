(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('productService', productService);

    /** @ngInject */
    function productService($http, $q, api, storeService, localStorageService){
      var FILTERS_VARIANTS = [
        {id:'5743703aef7d5e62e508e22d', key:'color', handle:'color', name: 'Color'},
        {id:'5743703aef7d5e62e508e223', key:'forma', handle:'forma', name: 'Forma'},
        {id:'5743703aef7d5e62e508e220', key:'tamano', handle:'tamano-camas-y-blancos-cama', name: 'Tamaño'},
        {id:'5743703aef7d5e62e508e226', key:'firmeza', handle: 'firmeza', name: 'Firmeza'}
      ];  
      var storePromotions = [];
      var service = {
        addSeenTime: addSeenTime,
        advancedSearch: advancedSearch,
        //formatProduct: formatProduct,
        formatSingleProduct: formatSingleProduct,
        formatProducts: formatProducts,
        getAllCategories: getAllCategories,
        getAllFilters: getAllFilters,
        getById: getById,
        getCategories: getCategories,
        getCategoryById: getCategoryById,
        getGroupProducts: getGroupProducts,
        getGroupVariants: getGroupVariants,
        getList: getList,
        getListNoImages: getListNoImages,
        getMainCategories: getMainCategories,
        getMainPromo: getMainPromo,
        loadVariants: loadVariants,
        search: search,
        searchByFilters: searchByFilters,
        sortProductImages: sortProductImages,
        searchCategoryByFilters: searchCategoryByFilters,
        delivery: delivery
      };

      return service;

      function getList(page, params){
        var p = page || 1;
        var url = '/product/find/' + p;
        return api.$http.post(url,params);
      }

      function getListNoImages(page, params){
        var p = page || 1;
        var url = '/product/find/' + p;
        params.noimages = true;
        return api.$http.post(url,params);
      }

      function getById(id){
        var url = '/product/findbyid/' + id;
        return api.$http.post(url);
      }

      function search(params){
        var url = '/product/search/';
        return api.$http.post(url, params);
      }

      function isUpperCase(str) {
          return str === str.toUpperCase();
      }

      function capitalizeFirstLetter(string){
        var text = string.toLowerCase();
        return text.charAt(0).toUpperCase() + text.slice(1);
      }


      function formatProduct(product){
        product.Name = product.Name || capitalizeFirstLetter(product.ItemName);
        /*
        if( product.Name && isUpperCase(product.Name) ) {
          product.Name = capitalizeFirstLetter(product.ItemName);
        }else{
          product.Name = product.ItemName;
        }
        */
        if (product.icon_filename && product.icon_filename !== 'null') {
          product.icons = [
            {url: api.baseUrl + '/uploads/products/' +  product.icon_filename, size:'default'}
          ];
          api.imageSizes.avatar.forEach(function(size){
            product.icons.push({
              url: api.baseUrl + '/uploads/products/'  + size +  product.icon_filename,
              size: size
            });
          });
        } else {
          product.icons = [
            {url: '', size:'default'}
          ];
        }
        product.mainPromo = getMainPromo(product);
        if(product.mainPromo){
          var maxDiscount = product.mainPromo.discountPg1;
          product.maxDiscount = maxDiscount;
          product.priceBefore = product.Price;
          product.Price = product.Price - ( ( product.Price / 100) * maxDiscount );
        }else{
          product.maxDiscount = 0;
          product.pricebefore = product.Price;
        }
        return product;
      }

      function formatSingleProduct(product){
        var deferred = $q.defer();
        var activeStoreId = localStorageService.get('activeStore');
        storeService.getPromosByStore(activeStoreId).then(function(res){
          storePromotions = res.data;
          var fProduct = formatProduct(product);
          deferred.resolve(fProduct);
        });
        return deferred.promise;
      }

      function getMainPromo(product){
        if(product.Promotions && product.Promotions.length > 0){
          var indexMaxPromo = 0;
          var maxPromo = 0;
          //Intersection product promotions and storePromotions
          product.Promotions = product.Promotions.filter(function(promotion){
            return _.findWhere(storePromotions, {id:promotion.id});
          });
          product.Promotions.forEach(function(promo, index){
            if(promo.discountPg1 >= maxPromo){
              maxPromo = promo.discountPg1;
              indexMaxPromo = index;
            }
          });
          return product.Promotions[indexMaxPromo];
        }else{
          return false;
        }
      }

      function sortProductImages(product){
        var idsList = product.ImagesOrder ? product.ImagesOrder.split(',') : [];
        var unSortedImages = [];
        var orderedList = [];
        if(idsList.length > 0 && product.ImagesOrder){
          var files = angular.copy(product.files);
          for(var i=0;i<idsList.length;i++){
            for(var j=0; j<files.length;j++){
              if(files[j].id === idsList[i]){
                orderedList.push(files[j]);
              }          
            }
          }
          //Checking if a file was not in the orderedList
          files.forEach(function(file){
            if( !_.findWhere(orderedList, {id: file.id}) ){
              orderedList.push(file);
            }
          });
          orderedList.concat(unSortedImages);
        }

        if(orderedList.length === 0){
          return false;
        }

        return orderedList;
      }

      function formatProducts(products){
        var deferred = $q.defer();
        var activeStoreId = localStorageService.get('activeStore');
        storeService.getPromosByStore(activeStoreId).then(function(res){
          storePromotions = res.data;
          var formatted = products.map(formatProduct);
          deferred.resolve(formatted);
        });
        return deferred.promise;
        //return formatted;
      }

      //CATEGORIES
      function getCategories(page, params){
        var p = page || 1;
        var url = '/productcategory/find/' + p;
        return api.$http.post(url, params);
      }

      function getMainCategories(){
        var url = '/productcategory/getmaincategories';
        return api.$http.post(url);
      }

      function getAllCategories(){
        var url = '/productcategory/getallcategories';
        return api.$http.post(url);
      }

      function getCategoryById(id){
        var url = '/productcategory/findbyid/' + id;
        return api.$http.post(url);
      }

      function getAllFilters(params){
        var url = '/productfilter/list/';
        return api.$http.post(url,params);
      }

      function getGroupVariants(id){
        var url = '/productgroup/getgroupvariants/' + id;
        return api.$http.post(url);
      }

      function getGroupProducts(params){
        var id = params.id;
        var url = '/productgroup/getvariantgroupproducts/' + id;
        return api.$http.post(url);
      }

      function advancedSearch(params){
        var url = '/product/advancedsearch/';
        return api.$http.post(url, params);
      }

      function searchByFilters(params){
        var url = '/product/searchbyfilters/';
        return api.$http.post(url, params);
      }

      function searchCategoryByFilters(params) {
        var url = '/ProductSearch/searchByCategory';
        return api.$http.post(url, params);
      }

      function delivery(productCode, storeId) {
        var url    = '/shipping/product';
        var params = {
          productCode: productCode,
          storeId: storeId
        };
        return api.$http.get(url, params).then(function(res){
          return res.data;
        });
      }

      function addSeenTime(itemCode){
        var url = '/product/addseen/' + itemCode;
        return api.$http.post(url);
      }

      function getVariantGroupProducts(product){
        var variantGroup = false;
        product.Groups.forEach(function(group){
          if(group.Type === 'variations'){
            variantGroup = group;
          }
        });
        if(variantGroup && variantGroup.id){
          var query = {
            id: variantGroup.id
          };
          return getGroupProducts(query);
        }
        var deferred = $q.defer();
        deferred.resolve({});
        return deferred.promise;
      }

      function loadVariants(product, activeStore){
        var deferred = $q.defer();
        var variants = {};
        getVariantGroupProducts(product)
          .then(function(result){
            var products = result.data || [];
            if(products.length > 0){
              FILTERS_VARIANTS.forEach(function(filter){
                variants[filter.key] = {};
                angular.copy(filter, variants[filter.key]);
                variants[filter.key].products = [];
              });
              products.forEach(function( product ){
                FILTERS_VARIANTS.forEach(function (filter){
                  var values = _.where( product.FilterValues, { Filter: filter.id } );
                  values.forEach(function(val){
                    console.log('product', product);
                    val.product = product.ItemCode;
                    val.stock   = product.Available;
                    val.stock   = product[activeStore.code];
                  });
                  values = values.filter(function(val){
                    return val.stock > 0;
                  });
                  if(values.length > 0){
                    var aux = {id: product.ItemCode, filterValues : values};
                    variants[filter.key].products.push(aux);
                  }
                });
              });
            }
            deferred.resolve(variants);
          })
          .catch(function(err){
            deferred.reject(err);
          });
        return deferred.promise;
      }


    }


})();
