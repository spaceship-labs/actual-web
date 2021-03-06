(function (){
    'use strict';

    angular
        .module('actualWebApp')
        .factory('siteService', siteService);

    /** @ngInject */
    function siteService($http, $q, api){

      var service = {
        findByHandle: findByHandle,
        findSiteBannersByHandle: findSiteBannersByHandle, 
        getStoresIdMapper:getStoresIdMapper,
        sortSiteBanners: sortSiteBanners
      };

      return service;

      function findByHandle(handle, params){
        var url = '/site/findbyhandle/' + handle;
        return api.$http.post(url, params);
      }

      function findSiteBannersByHandle(handle){
        var url = '/site/banners/' + handle;
        return api.$http.get(url).then(function(res) {
          return res.data;
        });        
      }

      function getStoresIdMapper(){
        var storesMap = {
          '5876b417d21cb61c6e57db63': 'actualhome.com',
          '589b5fdd24b5055c104fd5b8': 'actualstudio.com',
          '58ab5fa9d21cb61c6ec4473c': 'actualkids.com' 
        };

        return storesMap;
      }

      function sortSiteBanners(site){
        var idsList = site.bannersOrder ? site.bannersOrder.split(',') : [];
        var unSortedImages = [];
        var orderedList = [];

        if(!site.Banners){
          return [];
        }

        if(site.Banners.length === 0){
          return [];
        }

        if(!site.bannersOrder || site.bannersOrder.length === 0){
          return site.Banners;
        }

        if(idsList.length > 0 && site.bannersOrder){
          var files = angular.copy(site.Banners);
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


    }


})();
