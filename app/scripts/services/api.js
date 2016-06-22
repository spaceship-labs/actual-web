(function ()
{
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('api', apiService);

    /** @ngInject */
    function apiService($resource, $http){

        var api = {};

        // Base Url
        //api.baseUrl = 'http://actual-api.herokuapp.com';
        api.baseUrl = 'http://localhost:1337';
        //api.baseUrl = 'http://localhost:1338';

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

        /**
         * You can use this service to define your API urls. The "api" service
         * is designed to work in parallel with "apiResolver" service which you can
         * find in the "app/core/services/api-resolver.service.js" file.
         *
         * You can structure your API urls whatever the way you want to structure them.
         * You can either use very simple definitions, or you can use multi-dimensional
         * objects.
         *
         * Here's a very simple API url definition example:
         *
         *      api.getBlogList = $resource('http://api.example.com/getBlogList');
         *
         * While this is a perfectly valid $resource definition, most of the time you will
         * find yourself in a more complex situation where you want url parameters:
         *
         *      api.getBlogById = $resource('http://api.example.com/blog/:id', {id: '@id'});
         *
         * You can also define your custom methods. Custom method definitions allows you to
         * add hardcoded parameters to your API calls that you want them to be sent every
         * time you make that API call:
         *
         *      api.getBlogById = $resource('http://api.example.com/blog/:id', {id: '@id'}, {
         *         'getFromHomeCategory' : {method: 'GET', params: {blogCategory: 'home'}}
         *      });
         *
         * In addition to these definitions, you can also create multi-dimensional objects.
         * They are nothing to do with the $resource object, it's just a more convenient
         * way that we have created for you to packing your related API urls together:
         *
         *      api.blog = {
         *          list     : $resource('http://api.example.com/blog);
         *          getById  : $resource('http://api.example.com/blog/:id', {id: '@id'});
         *          getByDate: $resource('http://api.example.com/blog/:date', {id: '@date'},
         *              'get': {method: 'GET', params: {getByDate: true}}
         *          );
         *      }
         *
         * If you look at the last example from above, we overrode the 'get' method to put a
         * hardcoded parameter. Now every time we make the "getByDate" call, the {getByDate: true}
         * object will also be sent along with whatever data we are sending.
         *
         * All the above methods are using standard $resource service. You can learn more about
         * it at: https://docs.angularjs.org/api/ngResource/service/$resource
         *
         * -----
         *
         * After you defined your API urls, you can use them in Controllers, Services and even
         * in the UIRouter state definitions.
         *
         * If we use the last example from above, you can do an API call in your Controllers and
         * Services like this:
         *
         *      function MyController (api)
         *      {
         *          // Get the blog list
         *          api.blog.list.get({},
         *
         *              // Success
         *              function (response)
         *              {
         *                  console.log(response);
         *              },
         *
         *              // Error
         *              function (response)
         *              {
         *                  console.error(response);
         *              }
         *          );
         *
         *          // Get the blog with the id of 3
         *          var id = 3;
         *          api.blog.getById.get({'id': id},
         *
         *              // Success
         *              function (response)
         *              {
         *                  console.log(response);
         *              },
         *
         *              // Error
         *              function (response)
         *              {
         *                  console.error(response);
         *              }
         *          );
         *
         *          // Get the blog with the date by using custom defined method
         *          var date = 112314232132;
         *          api.blog.getByDate.get({'date': date},
         *
         *              // Success
         *              function (response)
         *              {
         *                  console.log(response);
         *              },
         *
         *              // Error
         *              function (response)
         *              {
         *                  console.error(response);
         *              }
         *          );
         *      }
         *
         * Because we are directly using $resource servive, all your API calls will return a
         * $promise object.
         *
         * --
         *
         * If you want to do the same calls in your UI Router state definitions, you need to use
         * "apiResolver" service we have prepared for you:
         *
         *      $stateProvider.state('app.blog', {
         *          url      : '/blog',
         *          views    : {
         *               'content@app': {
         *                   templateUrl: 'app/main/apps/blog/blog.html',
         *                   controller : 'BlogController as vm'
         *               }
         *          },
         *          resolve  : {
         *              Blog: function (apiResolver)
         *              {
         *                  return apiResolver.resolve('blog.list@get');
         *              }
         *          }
         *      });
         *
         *  You can even use parameters with apiResolver service:
         *
         *      $stateProvider.state('app.blog.show', {
         *          url      : '/blog/:id',
         *          views    : {
         *               'content@app': {
         *                   templateUrl: 'app/main/apps/blog/blog.html',
         *                   controller : 'BlogController as vm'
         *               }
         *          },
         *          resolve  : {
         *              Blog: function (apiResolver, $stateParams)
         *              {
         *                  return apiResolver.resolve('blog.getById@get', {'id': $stateParams.id);
         *              }
         *          }
         *      });
         *
         *  And the "Blog" object will be available in your BlogController:
         *
         *      function BlogController(Blog)
         *      {
         *          var vm = this;
         *
         *          // Data
         *          vm.blog = Blog;
         *
         *          ...
         *      }
         */


    }

})();
