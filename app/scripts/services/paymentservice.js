(function (){
  'use strict';

  angular
    .module('dashexampleApp')
    .factory('paymentService', paymentService);

  function paymentService(api, $filter){
    var service = {
      getPaymentMethodsGroups: getPaymentMethodsGroups,
      getPaymentOptionsByMethod: getPaymentOptionsByMethod
    };

var paymentGroups = [
      {
        group:1,
        discountKey:'discountPg1',
        methods: [
         {
            label:'Efectivo MXN',
            name:'Efectivo MXN',
            type:'cash',
            currency: 'mxn',
            needsVerification: false
          },
          {
            label:'Efectivo USD',
            name:'Efectivo USD',
            type:'cash-usd',
            currency:'usd',
            description:'Tipo de cambio $18.76 MXN',
            needsVerification: false
          },
          {
            label:'Cheque',
            name:'Cheque',
            type:'cheque',
            description:'Sujeto a verificación contable',
            currency:'mxn',
            needsVerification: false
          },
          {
            label:'Deposito',
            name:'Deposito',
            type:'deposit',
            description:'Sujeto a verificación contable',
            currency:'mxn',
            needsVerification: false
          },
          {
            label:'Transferencia',
            name:'Transferencia',
            type:'transfer',
            description:'Sujeto a verificación contable',
            currency: 'mxn',
            terminals:[
              {label:'American Express', value:'american-express'},
              {label:'Banamex', value:'banamex'},
              {label:'Bancomer', value:'bancomer'},
              {label:'Banorte', value:'banorte'},
              {label:'Santander', value:'santander'}
            ],            
            needsVerification: true
          },
          {
            label:'Monedero electrónico',
            name:'Monedero electrónico',
            type:'ewallet',
            description:'Sujeto a verificación contable',
            currency: 'mxn',
            needsVerification: false
          },
          {
            label:'1 pago con',
            name:'Una sola exhibición terminal',
            type:'single-payment-terminal',
            //type:'credit-card',
            description:'VISA, MasterCard, American Express',
            cardsImages:['images/visa.png','images/mastercard.png','images/american.png'],
            cards:['Visa','MasterCard','American Express'],
            terminals:[
              {label:'American Express', value:'american-express'},
              {label:'Banamex', value:'banamex'}
            ],
            currency: 'mxn',
            needsVerification: true,
            min:0
          },
        ]
      },
      {
        group:2,
        discountKey:'discountPg2',
        methods: [
          {
            label:'3',
            name:'3 meses sin intereses',
            type:'3-msi',
            msi:3,
            cardsImages:[
              'images/amexcard.png',
              'images/banamex.png',
              'images/bancomer.png',
            ],
            cards: [
              'Afirme',
              'Banbajio',
              'Banca Mifel',
              'Banco Ahorro Famsa',
              'Banjercito',
              'Banorte',
              'Banregio',
              'Inbursa',
              'Itaucard',
              'Ixe',
              'Liverpool Premium Card',
              'Santander',
              'Scotiabank'
            ],
            moreCards: true,
            terminals:[
              {label:'American Express', value:'american-express'},
              {label:'Banamex', value:'banamex'},
              {label:'Bancomer', value:'bancomer'},
              {label:'Banorte', value:'banorte'},
              {label:'Santander', value:'santander'}
            ],
            currency: 'mxn',
            min:300,
            needsVerification: true
          }
        ]
      },
      {
        group:3,
        discountKey:'discountPg3',
        methods: [
          {
            label:'6',
            name:'6 meses sin intereses',
            type:'6-msi',
            msi:6,
            cardsImages:[
              'images/amexcard.png',
              'images/banamex.png',
              'images/bancomer.png',
            ],
            cards:[
              'Afirme',
              'Banbajio',
              'Banca Mifel',
              'Banco Ahorro Famsa',
              'Banjercito',
              'Banorte',
              'Banregio',
              'Inbursa',
              'Itaucard',
              'Ixe',
              'Liverpool Premium Card',
              'Santander',
              'Scotiabank'
            ],
            moreCards: true,
            terminals:[
              {label:'American Express', value:'american-express'},
              {label:'Banamex', value:'banamex'},
              {label:'Bancomer', value:'bancomer'},
              {label:'Banorte', value:'banorte'},
              {label:'Santander', value:'santander'}
            ],
            currency: 'mxn',
            min:600,
            needsVerification: true
          },
          {
            label:'9',
            name:'9 meses sin intereses',
            type:'9-msi',
            msi:9,
            cardsImages:[
              'images/amexcard.png',
              'images/banamex.png',
              'images/bancomer.png',
            ],
            cards:[
              'Banorte',
              'Santander'
            ],
            moreCards: true,
            terminals:[
              {label:'American Express', value:'american-express'},
              {label:'Banamex', value:'banamex'},
              {label:'Bancomer', value:'bancomer'},
              {label:'Santander', value:'santander'}
            ],
            currency: 'mxn',
            min:900,
            needsVerification: true
          },
        ]
      },
      {
        group:4,
        discountKey:'discountPg4',
        methods: [
          {
            label:'12',
            name:'12 meses sin intereses',
            type:'12-msi',
            msi:12,
            cardsImages:[
              'images/amexcard.png',
              'images/banamex.png',
              'images/bancomer.png',
            ],
            cards:[
              'Afirme',
              'Banbajio',
              'Banca Mifel',
              'Banco Ahorro Famsa',
              'Banjercito',
              'Banorte',
              'Banregio',
              'Inbursa',
              'Itaucard',
              'Ixe',
              'Liverpool Premium Card',
              'Santander',
              'Scotiabank'
            ],
            moreCards: true,
            terminals:[
              {label:'American Express', value:'american-express'},
              {label:'Banamex', value:'banamex'},
              {label:'Bancomer', value:'bancomer'},
              {label:'Banorte', value:'banorte'},
              {label:'Santander', value:'santander'}
            ],
            currency: 'mxn',
            min: 1200,
            needsVerification: true
          },
        ]
      },
      {
        group:5,
        discountKey:'discountPg5',
        methods: [
          {
            label:'18',
            name:'18 meses sin intereses',
            type:'18-msi',
            msi:18,
            cardsImages:[
              'images/banamex.png',
              'images/amexcard.png'
            ],
            cards: [
              'American Express',
              'Banamex'
            ],
            terminals:[
              {label:'American Express', value:'american-express'},
              {label:'Banamex', value:'banamex'}
            ],
            currency: 'mxn',
            needsVerification: true,
            min:2000
          },
        ]
      }
    ];

   	/*
   	var paymentsOptions2 = [
   		{
   			terminal: {value:'american-express', label:'American Express'},
   			storesTypes: ['home','studio'],
   			paymentTypes: ['single-payment-terminal'],
   			cards: [{label:'American Express', value:'american-express'}],

   		},
   		{
   			terminal: {value:'american-express', label:'American Express'},
   			cards:[
   				{label:'American Express', value:'american-express'}
   			],
   			storesTypes:['studio'],
   			paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi']
   		},
   		{
   			terminal: {label:'Banamex', value:'banamex'},
   			storesTypes: ['home','studio'],
   			paymentTypes: ['single-payment-terminal'],
   			cards:[
   				{label:'Banamex', value:'banamex'},
   				{label:'Santander', value:'santander'},
   				{label:'Bancomer', value:'bancomer'},
   				{label:'Banorte', value:'banorte'},
   				{label:'IXE', value:'ixe'},
   				{label:'Scotiabank', value:'scotiabank'},
   				{label:'Inbursa', value:'inbursa'},
   				{label:'Afirme', value:'afirme'},
   				{label:'Banbajio', value:'banbajio'},
   				{label:'Banjercito', value:'banjercito'},
   				{label:'Bancamifel', value:'bancamifel'},
   				{label:'Itaucard', value:'itaucard'},
   				{label:'Liverpool Premium Card', value:'liverpool-premium-card'},
   				{label:'Banregio', value:'banregio'},
   				{label:'Banco Ahorro Famsa', value:'banco-ahorro-famsa'},
   			]
   		},
   		{
   			terminal: {label:'Banamex', value:'banamex'},
   			storesTypes: ['home','studio'],
   			paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
   			cards:[
   				{label:'Banamex', value:'banamex'},
   			]
   		},
   		{
   			terminal: {label:'Santander', value:'santander'},
   			storesTypes: ['home','studio'],
   			paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
   			cards:[
   				{label:'Santander', value:'santander'},
   			]   			
   		},
   		{
   			terminal: {label:'Bancomer', value:'bancomer'},
   			storesTypes: ['home','studio'],
   			paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
   			cards:[
   				{label:'Bancomer', value:'bancomer'},
   			]   			
   		}    		   		
   	];
   	*/
   	
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
   			paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
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
   			paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
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
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
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
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
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
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
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
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
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
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
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
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
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
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
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
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
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
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
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
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
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
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
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
        paymentTypes: ['3-msi','6-msi','9-msi','12-msi','18-msi'],
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
      return paymentGroups;
    }    
    
    return service;
  }

})();
