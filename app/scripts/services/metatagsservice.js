'use strict';

/**
 * @ngdoc service
 * @name dashexampleApp.metaTagsService
 * @description
 * # metaTagsService
 * Service in the dashexampleApp.
 */
angular.module('dashexampleApp')
  .service('metaTagsService', function ($rootScope, $location, $filter) {

    this.getBasePath = function(){
      this.path = $location.path();
      return this.path;
    };

    this.setMetaTags = function(params){
      var domainUrl = $location.protocol() + "://" + $location.host() + ":" + $location.port();
      var defaultParams = {
        title:'Actual | Más de 25 años de experiencia en muebles e interiorismo.',
        description: 'Amamos el arte moderno y la arquitectura, los interiores y los objetos extraordinarios, amamos el arte transformado en muebles y piezas decorativas.',
        image: domainUrl+'/images/Logo-A-Home.png'
      };

      switch($rootScope.siteTheme){
        case 'actual-home':
          defaultParams.image = domainUrl+'/images/Logo-A-Home.png';
          break;
        case 'actual-studio':
          defaultParams.image = domainUrl+'/images/Logo-A-Studio.png';
          break;
        case 'actual-kids':
          defaultParams.image = domainUrl+'/images/Logo-A-Kids.png';
          break;
      }

      if(!params){
        params = defaultParams;
      }
      var description = $filter('htmlToPlainText')(params.description) || defaultParams.description;
      var title =  params.title || defaultParams.title;
      var generalName = $rootScope.siteConstants.publicName || 'Actual Group';
      var image = params.image ||  defaultParams.image;

      $rootScope.metatags = {
        title: title,
        description: description,
        fb_title: title,
        fb_site_name: generalName ,
        fb_url: domainUrl + this.getBasePath() ,
        fb_description: description,
        fb_type: 'article',
        fb_image: image
      };

      $rootScope.$emit('metatagsChanged',$rootScope.metatags);
    };

  });
