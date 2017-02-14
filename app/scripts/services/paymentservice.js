(function (){
  'use strict';

  angular
    .module('dashexampleApp')
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
      getRefundsOptions: getRefundsOptions,
      updateQuotationClientBalance: updateQuotationClientBalance,
      clientBalanceType: CLIENT_BALANCE_TYPE
    };

    var refundsOptions = [
      {
        name:'Reembolso a cuenta de cliente',
        label: 'Reembolso a cuenta de cliente',
        description: 'Descripción',
        type:'refund-to-account',
        currency: 'mxn'
      },
      {
        name: 'Reembolso en efectivo',
        label: 'Reembolso en efectivo',
        description: 'Descripción',
        type: 'cash-refund',
        currency: 'mxn'
      }
    ];

    var paymentsOptions = [
      {
        card: {label:'American Express', value:'american-express'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home','studio'],
        terminal: {label:'American Express', value:'american-express'}
      },
      {
        card: {label:'American Express', value:'american-express'},
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
        storesTypes:['studio'],
        terminal: {label:'American Express', value:'american-express'}
      },
      {
        card:{label:'Banamex', value:'banamex'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}
      },      
      {
        card:{label:'Banamex', value:'banamex'},
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
        storesTypes:['home','studio'],
        terminal: {label:'Banamex', value:'banamex'}
      },
      {
        card:{label:'Santander', value:'santander'},
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Santander', value:'santander'}
      },
      {
        card:{label:'Santander', value:'santander'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}
      },        
      {
        card:{label:'Bancomer', value:'bancomer'},
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi'],
        storesTypes:['home','studio'],
        terminal: {label:'Bancomer', value:'bancomer'}        
      },
      {
        card:{label:'Bancomer', value:'bancomer'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}
      },
      {
        card:{label:'Banorte', value:'banorte'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Banorte', value:'banorte'},
        paymentTypes: ['3-msi','6-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}        
      },
      {
        card:{label:'IXE', value:'ixe'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'IXE', value:'ixe'},
        paymentTypes: ['3-msi','6-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}        
      },  
      {
        card:{label:'ScotiaBank', value:'scotiabank'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'ScotiaBank', value:'scotiabank'},
        paymentTypes: ['3-msi','6-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}        
      }, 
      {
        card:{label:'Inbursa', value:'inbursa'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Inbursa', value:'inbursa'},
        paymentTypes: ['3-msi','6-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}        
      }, 
      {
        card:{label:'Afirme', value:'afirme'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Afirme', value:'afirme'},
        paymentTypes: ['3-msi','6-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}        
      }, 
      {
        card:{label:'Banbajio', value:'banbajio'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Banbajio', value:'banbajio'},
        paymentTypes: ['3-msi','6-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}        
      }, 
      {
        card:{label:'Banjercito', value:'banjercito'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Banjercito', value:'banjercito'},
        paymentTypes: ['3-msi','6-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}        
      }, 
      {
        card:{label:'Bancamifel', value:'bancamifel'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Bancamifel', value:'bancamifel'},
        paymentTypes: ['3-msi','6-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}        
      }, 
      {
        card:{label:'Itaucard', value:'itaucard'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Itaucard', value:'itaucard'},
        paymentTypes: ['3-msi','6-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}        
      },
      {
        card:{label:'Liverpool Premium Card', value:'liverpool-premium-card'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Liverpool Premium Card', value:'liverpool-premium-card'},
        paymentTypes: ['3-msi','6-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}        
      },                                                                                
      {
        card:{label:'Banregio', value:'banregio'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Banregio', value:'banregio'},
        paymentTypes: ['3-msi','6-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}        
      },
      {
        card:{label:'Banco Ahorro Famsa', value:'banco-ahorro-famsa'},
        paymentTypes: ['single-payment-terminal'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banamex', value:'banamex'}        
      },                    
      {
        card:{label:'Banco Ahorro Famsa', value:'banco-ahorro-famsa'},
        paymentTypes: ['3-msi','6-msi','12-msi'],
        storesTypes:['home', 'studio'],
        terminal: {label:'Banorte', value:'banorte'}        
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

    function getRefundsOptions(){
      return refundsOptions;
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
      var type = '1 sola exhibición';
      if(payment.type === 'cash' || payment.type === 'cash-usd'){
        type = 'Pago de contado';
      }else if(payment.msi){
        type = payment.msi + ' meses sin intereses';
      }else if(payment.type === 'transfer'){
        type = 'Transferencia';
      }else if(payment.type === 'deposit'){
        type = 'Deposito';
      }else if(payment.type === 'ewallet'){
        type = 'Monedero electrónico';
      }else if(payment.type === 'client-balance'){
        type = 'Saldo a favor cliente';
      }
      return type;
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
