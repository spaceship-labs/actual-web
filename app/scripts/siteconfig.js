'use strict';

angular
  .module('siteconfig', [])

  .constant('SITE', {
    name: 'actual-home',
    publicName: 'Actual Home',
    baseUrl: 'https://actualhome.com',
    domain: 'actualhome.com',
    fb_url: 'https://www.facebook.com/ActualHomeMx',
    instagram_url: 'https://www.instagram.com/actualhome_mx/',
    foursquare_url: 'https://es.foursquare.com/p/actual-home/90458136',
    pinterest_url: 'https://es.pinterest.com/ActualGroup/'
  });