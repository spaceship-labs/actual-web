'use strict';

/**
 * @ngdoc service
 * @name dashexampleApp.breadcrumbService
 * @description
 * # breadcrumbService
 * Service in the dashexampleApp.
 */
angular.module('dashexampleApp')
  .service('breadcrumbService', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function

    var service = {
    	buildProductBreadcrumb: buildProductBreadcrumb,
    	buildCategoryBreadcrumb: buildCategoryBreadcrumb,
    	isFilledBreadcrumb: isFilledBreadcrumb,
    	isActiveBreadcrumbItem: isActiveBreadcrumbItem
    };

    function buildProductBreadcrumb(productCategories){
	    var breadcrumb = [];
	    var groupedCategories = _.groupBy(productCategories, 'CategoryLevel');
	    var categoryLevels = 3;
	    for(var i=1;i<=categoryLevels; i++){
	    	if(groupedCategories[i]){
	    		breadcrumb.push(groupedCategories[i]);
	    	}
	    }
	    return breadcrumb;
    }

    function buildCategoryBreadcrumb(categoriesTree, currentCategoryId){
    	var categoriesLvl1 = filterCategories(categoriesTree, currentCategoryId);
    	
    	var categoriesLvl2 = categoriesTree.reduce(function(acum, categoryLvl1){
    		if(categoryLvl1.Childs){
    			acum = acum.concat(categoryLvl1.Childs);
    		}
    		return acum;
    	},[]);
    	categoriesLvl2 = filterCategories(categoriesLvl2, currentCategoryId);

    	var categoriesLvl3 = categoriesLvl2.reduce(function(acum, categoryLvl2){
    		if(categoryLvl2.Childs){
    			acum = acum.concat(categoryLvl2.Childs);
    		}
    		return acum;
    	},[]);
    	categoriesLvl3 = filterCategories(categoriesLvl3, currentCategoryId);

    	var breadcrumb = [categoriesLvl1, categoriesLvl2, categoriesLvl3];
    	return breadcrumb;
    }

    function isFilledBreadcrumb(breadcrumb){

    	var isFilled = _.some(breadcrumb, function(itemGroup){
    		return itemGroup.length > 0;
    	});

    	return isFilled;

    }

    function filterBreadcrumbItems(breadcrumb){
    }

    function filterCategories(categories, currentCategoryId){
    	var filtered = categories.filter(function(category){
    		return category.isActive;
    	});
    	return filtered;
    }

    function tagBreadcrumbActiveItems(breadcrumb){
    	if(breadcrumb.length > 0){
    		var lastIndex = getLastGroupIndex(breadcrumb);

				if(breadcrumb[lastIndex]){
	    		breadcrumb[lastIndex] = breadcrumb[lastIndex].map(function(item){
	    			item.activeItem = true;
	    			return item;
	    		});
	    	}
    	}

    	return breadcrumb;
    }

    function isActiveBreadcrumbItem(breadcrumb, groupIndex){
    	var lastIndex = getLastGroupIndex(breadcrumb);

    	if(groupIndex === lastIndex){
    		return true;
    	}
    	return false;
    }

    function getLastGroupIndex(breadcrumb){
    	var index = false;
    	for(var i = (breadcrumb.length-1); i >=0 ; i--){
    		if(breadcrumb[i].length > 0){
    			index = i;
    			break;
    		}
    	}

    	return index;
    }

    return service;
  });
