(function (){
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('checkoutService', checkoutService);

    /** @ngInject */
    function checkoutService(
      $http,
      $location,
      $q,
      $filter,
      api,
      clientService,
      commonService,
      quotationService
    ){


      var service = {
        areMethodsDisabled: areMethodsDisabled,
        isActivePaymentGroup:isActivePaymentGroup,
        isActiveMethod: isActiveMethod,
        getPaidPercentage: getPaidPercentage,
        getGroupByQuotation: getGroupByQuotation,
        isMinimumPaid: isMinimumPaid,
        returnToCheckout: returnToCheckout
      };

      function getPaidPercentage(quotation){
        if(!quotation){
          return false;
        }

        var percentage = 0;
        if(quotation){
          percentage = quotation.ammountPaid / (quotation.total / 100);
        }
        return percentage;
      }


      function isMinimumPaid(quotation){
        if(quotation){
          var minPaidPercentage = 100;
          if( getPaidPercentage(quotation) >= minPaidPercentage ){
            return true;
          }
        }
        return false;
      }

      function areMethodsDisabled(methods, quotation){
        if(!quotation){
          return false;
        }

        var areAllDisabled = methods.every(function(m){
          return !isActiveMethod(m, quotation);
        });

        return areAllDisabled;
      }

      function isActivePaymentGroup(group, quotation){
        if(!quotation){
          return false;
        }

        var isGroupUsed = false;
        var groupNumber = group.group;
        var currentGroup = getGroupByQuotation(quotation);
        var areGroupMethodsDisabled = areMethodsDisabled(group.methods, quotation);
        if( currentGroup < 0 || currentGroup === 1){
          isGroupUsed = true;
        }else if(currentGroup > 0 && currentGroup === groupNumber){
          isGroupUsed = true;
        }

        return isGroupUsed && !areGroupMethodsDisabled;
      }

      function isActiveMethod(method, quotation){
        if(!quotation){
          return false;
        }

        var remaining = method.total - (quotation.ammountPaid || 0);
        remaining = commonService.roundCurrency(remaining);
        var min = method.min || 0;

        if(remaining === 0){
          return false;
        }

        return remaining >= min;
      }

      function getGroupByQuotation(quotation){
        if(!quotation){
          return false;
        }

        var group = -1;
        if(quotation.Payments.length > 0){
          group = quotation.paymentGroup;
          var paymentsCount = quotation.Payments.length;
          group = quotation.Payments[paymentsCount - 1].group;
        }
        return group;
      }

      function returnToCheckout(){
        if($location.search() && $location.search().checkoutProcess){
          //var quotationId = $location.search().checkoutProcess;
          var quotationId = quotationService.getActiveQuotationId();
          if(quotationId){
            $location.path('/checkout/client/' + quotationId);
          }
        }
      }

      return service;

    }


})();
