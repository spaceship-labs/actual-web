'use strict';

/**
 * @ngdoc service
 * @name dashexampleApp.metaTagsService
 * @description
 * # metaTagsService
 * Service in the dashexampleApp.
 */
angular.module('dashexampleApp')
  .service('metaTagsService', function (api,$rootScope, $location, $filter) {

    this.getBasePath = function(){
      this.path = $location.path();
      return this.path;
    };

    this.getDescriptionBySiteTheme = function(){
      var description = 'Mobiliario y decoración para los más exigentes. Sofisticación absoluta que recuerda a los amantes del diseño la mezcla entre el modernismo y la exclusividad.';
      switch($rootScope.siteTheme){
        case 'actual-home':
          description = 'Mobiliario y decoración para los más exigentes. Sofisticación absoluta que recuerda a los amantes del diseño la mezcla entre el modernismo y la exclusividad.';
          break;
        case 'actual-studio':
          description = 'Mobiliario y decoración para la persona práctica y jovial; una bienvenida al mobiliario moderno, honesto y, sobre todo, funcional.';
          break;
        case 'actual-kids':
          description = 'Mobiliario y decoración para los más pequeños, la combinación perfecta de estilo, seguridad, interactividad y diversión.';          
          break;
      }
      return description;
    }

    this.setMetaTags = function(params){
      var domainUrl = $location.protocol() + "://" + $location.host() + ":" + $location.port();
      var defaultParams = {
        title:'Actual',
        description: 'Mobiliario y decoración para los más exigentes. Sofisticación absoluta que recuerda a los amantes del diseño la mezcla entre el modernismo y la exclusividad.',
        image: api.baseUrl+'/logos/home-og.png'
      };

      switch($rootScope.siteTheme){
        case 'actual-home':
          defaultParams.title = 'Actual Home';
          defaultParams.description = this.getDescriptionBySiteTheme();
          defaultParams.image = api.baseUrl+'/logos/home-og.png';
          break;
        case 'actual-studio':
          defaultParams.title = 'Actual Studio';
          defaultParams.description = this.getDescriptionBySiteTheme();
          defaultParams.image = api.baseUrl+'/logos/studio-og.png';
          break;
        case 'actual-kids':
          defaultParams.title = 'Actual Kids';        
          defaultParams.description = this.getDescriptionBySiteTheme();
          defaultParams.image = api.baseUrl+'/logos/kids-og.png';
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
