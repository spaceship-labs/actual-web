'use strict';
angular.module('actualWebApp')
  .controller('DeliveriesLocationsCtrl', function () {
  	var vm = this;
  	angular.extend(vm,{
			campecheIsActive:true,
			cdmxIsActive:false,
			jaliscoIsActive:false,
			stateOfMexicoIsActive:false,
			nuevoLeonIsActive:false,
			pueblaIsActive:false,
			queretaroIsActive:false,
			quintanaRooIsActive:false,
			tabascoIsActive:false,
			isVeracruzActive:false,
			isYucatanActive:false
  	});
  });
