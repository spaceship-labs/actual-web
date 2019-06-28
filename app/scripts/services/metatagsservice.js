'use strict';

/**
 * @ngdoc service
 * @name actualWebApp.metaTagsService
 * @description
 * # metaTagsService
 * Service in the actualWebApp.
 */
angular
  .module('actualWebApp')
  .service('metaTagsService', function(api, $rootScope, $location, $filter) {
    this.getBasePath = function() {
      this.path = $location.path();
      return this.path;
    };

    this.getDescriptionBySiteTheme = function() {
      var description =
        'Muebles y decoración; salas, comedores, sillas, recámaras. Decora tu hogar con muebles modernos y funcionales';
      switch ($rootScope.siteTheme) {
        case 'actual-home':
          description =
            'Muebles y decoración para los más exigentes, lujo accesible para amantes del diseño';
          break;
        case 'actual-studio':
          description =
            'Muebles y decoración; salas, comedores, sillas, recámaras. Decora tu hogar con muebles modernos y funcionales';
          break;
        case 'actual-kids':
          description =
            'Muebles y decoración infantiles para niños, bebés, papás. Seguridad, estilo, interactividad y diversión';
          break;
      }
      return description;
    };

    this.setMetaTags = function(params) {
      var domainUrl =
        $location.protocol() +
        '://' +
        $location.host() +
        ':' +
        $location.port();
      var defaultParams = {
        title: 'Actual',
        description:
          'Muebles y decoración; salas, comedores, sillas, recámaras. Decora tu hogar con muebles modernos y funcionales',
        image: api.baseUrl + '/logos/home-og.png'
      };

      switch ($rootScope.siteTheme) {
        case 'actual-home':
          defaultParams.title = 'Actual Home';
          defaultParams.description = this.getDescriptionBySiteTheme();
          defaultParams.image = api.baseUrl + '/logos/home-og.png';
          break;
        case 'actual-studio':
          defaultParams.title = 'Actual Studio';
          defaultParams.description = this.getDescriptionBySiteTheme();
          defaultParams.image = api.baseUrl + '/logos/studio-og.png';
          break;
        case 'actual-kids':
          defaultParams.title = 'Actual Kids';
          defaultParams.description = this.getDescriptionBySiteTheme();
          defaultParams.image = api.baseUrl + '/logos/kids-og.png';
          break;
      }

      if (!params) {
        params = defaultParams;
      }
      var description =
        $filter('htmlToPlainText')(params.description) ||
        defaultParams.description;
      var title = params.title || defaultParams.title;
      var generalName = $rootScope.siteConstants.publicName || 'Actual Group';
      var image = params.image || defaultParams.image;

      $rootScope.metatags = {
        title: title,
        description: description,
        fb_title: title,
        fb_site_name: generalName,
        fb_url: domainUrl + this.getBasePath(),
        fb_description: description,
        fb_type: 'article',
        fb_image: image
      };

      $rootScope.$emit('metatagsChanged', $rootScope.metatags);
    };
  });
