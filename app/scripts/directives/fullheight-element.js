'use strict';

/**
 * @ngdoc directive
 * @name dashexampleApp.directive:fullHeightElement
 * @description
 * # fullHeightElement
 */
 angular.module('dashexampleApp')
 .directive('fullHeightElement', function($window){


 	return function (scope, element) {// jshint ignore:line
 		var w = angular.element($window);

 		scope.getWindowDimensions = function () {

 			return { 'h': w.height() };
 		};

 		scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {// jshint ignore:line

 			scope.style = function (screenType) {
 				var header = $('#header');// jshint ignore:line
 				
 				var fixedHeader = $('.header-top-bar.fixed-head');
 				if(fixedHeader.length > 0){
 					header = fixedHeader;
 				}

 				var customHeight;
 				screenType = typeof screenType !== 'undefined' ? screenType : 'normal';

 				if(screenType === 'ignoreHeader'){
 					customHeight = newValue.h - header.outerHeight();
 				}else{
 					customHeight = newValue.h;
 				}

        //Aplicando una altura minima
        /*
        if(customHeight < 490){
          customHeight = 490;
        }
        */

 				return {
 					'height': (customHeight) + 'px',
 				};
 			};

 		}, true);

 		w.bind('resize', function () {
 			scope.$digest();
 		});
 	};

 });
