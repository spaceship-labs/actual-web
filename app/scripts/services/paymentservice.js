(function (){
  'use strict';

  angular
    .module('actualWebApp')
    .factory('paymentService', paymentService);

  function paymentService(api, $filter, $http, commonService, clientService, ewalletService){
    var CLIENT_BALANCE_GROUP_INDEX = 0;
    var CLIENT_BALANCE_TYPE = 'client-balance';

    var service = {
      addPayment: addPayment,
      cancelPayment: cancelPayment,
      getPaymentMethodsGroups: getPaymentMethodsGroups,
      getMethodAvailableBalance: getMethodAvailableBalance,
      getPaymentOptionsByMethod: getPaymentOptionsByMethod,
      getPaymentTypeString: getPaymentTypeString,
      getPaymentsTypesMapper: getPaymentsTypesMapper,
      updateQuotationClientBalance: updateQuotationClientBalance,
      getPaymentsTypes: getPaymentsTypes,
      clientBalanceType: CLIENT_BALANCE_TYPE
    };

    var paymentsOptions = [
      {
        card: {label:'American Express', value:'american-express'},
        paymentTypes: ['credit-card','3-msi','6-msi','9-msi','12-msi'],
        storesTypes:['home','studio'],
        terminal: {label:'American Express', value:'american-express'}
      },
      {
        card:{label:'Banamex', value:'banamex'},
        paymentTypes: ['credit-card','debit-card','3-msi','6-msi','9-msi','12-msi'],
        storesTypes:['home','studio'],
        terminal: {label:'Banamex', value:'banamex'}
      },
      {
        card:{label:'Santander', value:'santander'},
        paymentTypes: ['credit-card', 'debit-card','3-msi','6-msi','9-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Santander', value:'santander'}
      },
      {
        card:{label:'Bancomer', value:'bancomer'},
        paymentTypes: ['credit-card','3-msi','6-msi','9-msi','12-msi'],
        storesTypes:['home','studio'],
        terminal: {label:'Bancomer', value:'bancomer'}
      },
      {
        card:{label:'Banorte', value:'banorte'},
        paymentTypes: ['credit-card'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}
      },
      {
        card:{label:'Banorte', value:'banorte'},
        paymentTypes: ['credit-card','3-msi','6-msi', '9-msi','12-msi','18.msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}
      },
      {
        card: {label:'HSBC', value:'hsbc'},
        paymentTypes: ['credit-card','debit-card','3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home','studio','proyectos'],
        terminal: {label:'Banorte', value:'banorte'}
      },

      {
        card:{label:'IXE', value:'ixe'},
        paymentTypes: ['credit-card','3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}
      },
      {
        card:{label:'ScotiaBank', value:'scotiabank'},
        paymentTypes: ['credit-card'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}
      },
      {
        card:{label:'Inbursa', value:'inbursa'},
        paymentTypes: ['credit-card', 'debit-card','3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}
      },
      {
        card:{label:'Afirme', value:'afirme'},
        paymentTypes: ['credit-card','3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}
      },
      {
        card:{label:'Banbajio', value:'banbajio'},
        paymentTypes: ['credit-card','3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}
      },
      {
        card:{label:'Banjercito', value:'banjercito'},
        paymentTypes: ['credit-card','3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}
      },
      {
        card:{label:'Bancamifel', value:'bancamifel'},
        paymentTypes: ['credit-card','3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}
      },
      {
        card:{label:'Itaucard', value:'itaucard'},
        paymentTypes: ['credit-card','3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}
      },
      {
        card:{label:'Liverpool Premium Card', value:'liverpool-premium-card'},
        paymentTypes: ['credit-card','3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}
      },
      {
        card:{label:'Banregio', value:'banregio'},
        paymentTypes: ['credit-card','3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}
      },
      {
        card:{label:'Banco Ahorro Famsa', value:'banco-ahorro-famsa'},
        paymentTypes: ['credit-card','3-msi','6-msi', '9-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}
      },
      {
        card: {label:'Otra', value:'other'},
        paymentTypes: ['credit-card','debit-card'],
        storesTypes:['home','studio'],
        terminal: {
          label:'Banorte', value:'banorte'
        }
      },
    ];


   	function getPaymentOptionsByMethod(method){
   		var options = _.filter(paymentsOptions, function(option){
   			var hasPaymentType = false;
   			var hasStore = false;

        if(option.paymentTypes.indexOf(method.type) > -1){
 			 		hasPaymentType = true;
 			 	}

 			 	if(option.storesTypes.indexOf(method.storeType) > -1 ){
 			 		hasStore = true;
 			 	}

 			 	if(hasStore && hasPaymentType){
 			 		return true;
 			 	}

        return false;
   		});
   		return options;
   	}

    function getPaymentMethodsGroups(){
      var url = '/paymentgroups';
      return api.$http.get(url);
    }

    function getPaymentsTypes(){
      var url = '/payment/types';
      return api.$http.get(url).then(function(res) {
        return res.data;
      });    
    }

    function addPayment(quotationId, params){
      var url = '/payment/add/' + quotationId;
      return api.$http.post(url,params);
    }

    function cancelPayment(quotationId, paymentId){
      var url = '/payment/cancel/' + quotationId + '/' + paymentId;
      return api.$http.post(url);
    }

    function getPaymentTypeString(payment){
      var type = 'Tarjeta de crédito';
      var mapper = getPaymentsTypesMapper();
      type = mapper[payment.type] || type;
      return type;
    }


    function getPaymentsTypesMapper(){
      var mapper = {
        'debit-card': 'Tarjeta de débito',
        'credit-card': 'Tarjeta de crédito',
        'ewallet': 'Monedero electrónico',
        'client-balance': 'Saldo a favor cliente',
        'transfer': 'Transferencia',
        '3-msi': '3 meses sin intereses',
        '6-msi': '6 meses sin intereses',
        '9-msi': '9 meses sin intereses',
        '12-msi': '12 meses sin intereses',
        '18-msi': '18 meses sin intereses',
      };
      return mapper;
    }

    //@param quotation - Object quotation populated with Payments and Client
    function updateQuotationClientBalance(quotation,paymentMethodsGroups){
      var group = paymentMethodsGroups[CLIENT_BALANCE_GROUP_INDEX];
      var balancePaymentMethod = _.findWhere(group.methods, {type:CLIENT_BALANCE_TYPE});
      var balancePayments = _.where(quotation.Payments, {type:CLIENT_BALANCE_TYPE});
      clientService.getBalanceById(quotation.Client.id)
        .then(function(res){
          console.log('res', res);
          var balance = res.data || 0;
          var description = getClientBalanceDescription(balance);;
          if(balancePaymentMethod){
            balancePaymentMethod.description = description;
          }
          if(balancePayments){
            balancePayments = balancePayments.map(function(payment){
              payment.description = description;
              return payment;
            });
          }
        })
        .catch(function(err){
          console.log(err);
        });
    }

    function getMethodAvailableBalance(method, quotation){
      var EWALLET_TYPE = ewalletService.ewalletType;
      var balance = 0;

      if(method.type === EWALLET_TYPE || method.type === CLIENT_BALANCE_TYPE){
        if(method.type === EWALLET_TYPE){
          balance = quotation.Client.ewallet;
        }
        else if(method.type === CLIENT_BALANCE_TYPE){
          balance = quotation.Client.Balance;
        }
      }
      return balance;
    }

    function getClientBalanceDescription(balance){
      var description = '';
      var balanceRounded = commonService.roundCurrency( balance, {up:false} );
      var balanceStr = $filter('currency')(balanceRounded);
      description = 'Saldo disponible: ' + balanceStr +' MXN';
      return description;
    }


    return service;
  }

})();
