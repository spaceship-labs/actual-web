(function ()
{
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('api', apiService);

    /** @ngInject */
    function apiService($resource, $http, ENV){

        var api = {};

        // Base Url
        api.baseUrl = ENV.apiEndpoint;
        //api.baseUrl = 'http://localhost:1337';

        api.sample = $resource(api.baseUrl + 'sample/sample.json');

        api.quickPanel = {
            activities: $resource(api.baseUrl + 'quick-panel/activities.json'),
            contacts  : $resource(api.baseUrl + 'quick-panel/contacts.json'),
            events    : $resource(api.baseUrl + 'quick-panel/events.json'),
            notes     : $resource(api.baseUrl + 'quick-panel/notes.json')
        };


        api.lead = {
            find: $resource(api.baseUrl+'/saleopportunity/find/:page',{page:'@page',params: '@params'},
                {'get':{method:'post',format:'json',data:'params'}}
            )
        };

        api.line = {
            find: $resource(api.baseUrl+'/line/get',
                {'get':{method:'post',format:'json'}}
            )
        };

        api.color = {
            find: $resource(api.baseUrl+'/color/get',
                {'get':{method:'post',format:'json'}}
            )
        };

        api.imageSizes = {
          avatar : ['600x600','593x331','80x80','50x50','184x73','177x171','196x140','201x201','1000x1000','300x300'],
          gallery : ['110x105','593x331','600x600','1000x1000','300x300'],
        };

        api.$http = function(req) {
          var data = api.serialize(req);
          return $http(data);
        };

        api.$http.post = function(url, data) {
          var req = {method: 'post', url: url, data: data};
          return api.$http(req);
        };

        api.$http.get = function(url, data) {
          var req = {method: 'get', url: url, data: data};
          return api.$http(req);
        };

        api.serialize = function(req) {
          req.url = api.baseUrl + req.url;
          req.data = req.data || {};
          //req.data.apiKey = "#{APIKEY}";
          //req.data.hash = hash(req.data, $crypthmac);
          if (req.method === 'get') {
            req.url += '?';
            Object.keys(req.data).forEach(function(k) {
              req.url += '&'+k+ '=' + req.data[k];
            });
          }
          return req;
        };



        return api;


    }

})();
