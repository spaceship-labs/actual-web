(function (){
  'use strict';

  angular
    .module('dashexampleApp')
    .factory('commonService', commonService);

  function commonService($q, $timeout, $filter, $mdDialog){
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
            needsVerification: true
          },
          {
            label:'Monedero electrónico',
            name:'Monedero electrónico',
            type:'monedero',
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
            terminals:['Banamex','American Express'],
            currency: 'mxn',
            needsVerification: true
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
            cardsImages:['images/banamex.png','images/santander.png','images/banorte.png'],
            cards: ["AMEX", "Banamex", "Santander", "Bancomer", "Banorte", "IXE", "SCOTIABANK", "INBURSA", "AFIRME", "BANBAJIO", "BANJERCITO", "BANCAMIFEL", "ITAUCARD", "PREMIUMCARD", "BANREGIO", "BANCOAHORRO", " FAMSA"],
            moreCards: true,
            terminals:['Banorte','Santander','Bancomer','American Express'],
            currency: 'mxn',
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
            cardsImages:['images/banamex.png','images/amexcard.png','images/santander.png','images/bancomer.png','images/hsbc.png','images/banorte.png'],
            cards:['AFIRME', 'AMEX', 'Banamex', 'BANBAJIO', 'BANCAMIFEL', 'BANCOAHORRO', 'Bancomer', 'BANJERCITO', 'Banorte', 'BANREGIO', 'FAMSA', 'INBURSA', 'ITAUCARD', 'IXE', 'PREMIUMCARD', 'Santander', 'SCOTIABANK'],
            moreCards: true,
            terminals:['Banamex','Banorte','Santander','Bancomer','American Express'],
            currency: 'mxn',
            needsVerification: true
          },
          {
            label:'9',
            name:'9 meses sin intereses',
            type:'9-msi',
            msi:9,
            cardsImages:['images/banamex.png','images/amexcard.png','images/santander.png','images/bancomer.png','images/hsbc.png','images/banorte.png'],
            cards:['AFIRME', 'AMEX', 'Banamex', 'BANBAJIO', 'BANCAMIFEL', 'BANCOAHORRO', 'Bancomer', 'BANJERCITO', 'Banorte', 'BANREGIO', 'FAMSA', 'INBURSA', 'ITAUCARD', 'IXE', 'PREMIUMCARD', 'Santander', 'SCOTIABANK'],
            moreCards: true,
            terminals:['Banamex','Banorte','Santander','Bancomer','American Express'],
            currency: 'mxn',
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
            cardsImages:['images/banamex.png','images/amexcard.png','images/santander.png','images/bancomer.png','images/hsbc.png','images/banorte.png'],
            cards:['AFIRME', 'AMEX', 'Banamex', 'BANBAJIO', 'BANCAMIFEL', 'BANCOAHORRO', 'Bancomer', 'BANJERCITO', 'Banorte', 'BANREGIO', 'FAMSA', 'INBURSA', 'ITAUCARD', 'IXE', 'PREMIUMCARD', 'Santander', 'SCOTIABANK'],
            moreCards: true,
            terminals:['Banamex','Banorte','Santander','Bancomer','American Express'],
            currency: 'mxn',
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
            cardsImages:['images/banamex.png','images/amexcard.png'],
            cards: ['AMEX','Banamex'],
            terminals:['Banamex','Banorte','Santander','Bancomer','American Express'],
            currency: 'mxn',
            needsVerification: true
          },
        ]
      }
    ];

    var states = [
      {name:"Aguascalientes",code:"AG",alt:["AGS"],country:"MX"},
      {name:"Baja California",code:"BC",alt:["BCN"],country:"MX"},
      {name:"Baja California Sur",code:"BS",alt:["BCS"],country:"MX"},
      {name:"Campeche",code:"CM",alt:["Camp","CAM"],country:"MX"},
      {name:"Chiapas",code:"CS",alt:["Chis","CHP"],country:"MX"},
      {name:"Chihuahua",code:"CH",alt:["Chih","CHH"],country:"MX"},
      {name:"Coahuila",code:"MX",alt:["Coah","COA"],country:"MX"},
      {name:"Colima",code:"CL",alt:["COL"],country:"MX"},
      {name:"Ciudad de México",code:"DF",alt:["DIF"],country:"MX"},
      {name:"Durango",code:"DG",alt:["Dgo","DUR"],country:"MX"},
      {name:"Guanajuato",code:"GT",alt:["Gto","GUA"],country:"MX"},
      {name:"Guerrero",code:"GR",alt:["Gro","GRO"],country:"MX"},
      {name:"Hidalgo",code:"HG",alt:["Hgo","HID"],country:"MX"},
      {name:"Jalisco",code:"JA",alt:["Jal","JAL"],country:"MX"},
      {name:"Mexico",code:"ME",alt:["Edomex","MEX"],country:"MX"},
      {name:"Michoacán",code:"MI",alt:["Mich","MIC"],country:"MX"},
      {name:"Morelos",code:"MO",alt:["Mor","MOR"],country:"MX"},
      {name:"Nayarit",code:"NA",alt:["Nay","NAY"],country:"MX"},
      {name:"Nuevo León",code:"NL",alt:["NLE"],country:"MX"},
      {name:"Oaxaca",code:"OA",alt:["Oax","OAX"],country:"MX"},
      {name:"Puebla",code:"PU",alt:["Pue","PUE"],country:"MX"},
      {name:"Querétaro",code:"QE",alt:["Qro","QUE"],country:"MX"},
      {name:"Quintana Roo",code:"QR",alt:["Q Roo","ROO"],country:"MX"},
      {name:"San Luis Potosí",code:"SL",alt:["SLP"],country:"MX"},
      {name:"Sinaloa",code:"SI",alt:["SIN"],country:"MX"},
      {name:"Sonora",code:"SO",alt:["SON"],country:"MX"},
      {name:"Tabasco",code:"TB",alt:["TAB"],country:"MX"},
      {name:"Tamaulipas",code:"TM",alt:["Tamps","TAM"],country:"MX"},
      {name:"Tlaxcala",code:"TL",alt:["Tlax","TLA"],country:"MX"},
      {name:"Veracruz",code:"VE",alt:["VER"],country:"MX"},
      {name:"Yucatán",code:"YU",alt:["YUC"],country:"MX"},
      {name:"Zacatecas",code:"ZA",alt:["ZAC"],country:"MX"}
    ];

    var countries = [
      { name: "Afghanistan", code: "AF" },
      { name: "Åland Islands", code: "AX" },
      { name: "Albania", code: "AL" },
      { name: "Algeria", code: "DZ" },
      { name: "American Samoa", code: "AS" },
      { name: "Andorra", code: "AD" },
      { name: "Angola", code: "AO" },
      { name: "Anguilla", code: "AI" },
      { name: "Antarctica", code: "AQ" },
      { name: "Antigua and Barbuda", code: "AG" },
      { name: "Argentina", code: "AR" },
      { name: "Armenia", code: "AM" },
      { name: "Aruba", code: "AW" },
      { name: "Australia", code: "AU" },
      { name: "Austria", code: "AT" },
      { name: "Azerbaijan", code: "AZ" },
      { name: "Bahamas", code: "BS" },
      { name: "Bahrain", code: "BH" },
      { name: "Bangladesh", code: "BD" },
      { name: "Barbados", code: "BB" },
      { name: "Belarus", code: "BY" },
      { name: "Belgium", code: "BE" },
      { name: "Belize", code: "BZ" },
      { name: "Benin", code: "BJ" },
      { name: "Bermuda", code: "BM" },
      { name: "Bhutan", code: "BT" },
      { name: "Bolivia", code: "BO" },
      { name: "Bosnia and Herzegovina", code: "BA" },
      { name: "Botswana", code: "BW" },
      { name: "Bouvet Island", code: "BV" },
      { name: "Brazil", code: "BR" },
      { name: "British Indian Ocean Territory", code: "IO" },
      { name: "Brunei Darussalam", code: "BN" },
      { name: "Bulgaria", code: "BG" },
      { name: "Burkina Faso", code: "BF" },
      { name: "Burundi", code: "BI" },
      { name: "Cambodia", code: "KH" },
      { name: "Cameroon", code: "CM" },
      { name: "Canada", code: "CA" },
      { name: "Cape Verde", code: "CV" },
      { name: "Cayman Islands", code: "KY" },
      { name: "Central African Republic", code: "CF" },
      { name: "Chad", code: "TD" },
      { name: "Chile", code: "CL" },
      { name: "China", code: "CN" },
      { name: "Christmas Island", code: "CX" },
      { name: "Cocos (Keeling) Islands", code: "CC" },
      { name: "Colombia", code: "CO" },
      { name: "Comoros", code: "KM" },
      { name: "Congo", code: "CG" },
      { name: "Congo, The Democratic Republic of the", code: "CD" },
      { name: "Cook Islands", code: "CK" },
      { name: "Costa Rica", code: "CR" },
      { name: "Cote D'Ivoire", code: "CI" },
      { name: "Croatia", code: "HR" },
      { name: "Cuba", code: "CU" },
      { name: "Cyprus", code: "CY" },
      { name: "Czech Republic", code: "CZ" },
      { name: "Denmark", code: "DK" },
      { name: "Djibouti", code: "DJ" },
      { name: "Dominica", code: "DM" },
      { name: "Dominican Republic", code: "DO" },
      { name: "Ecuador", code: "EC" },
      { name: "Egypt", code: "EG" },
      { name: "El Salvador", code: "SV" },
      { name: "Equatorial Guinea", code: "GQ" },
      { name: "Eritrea", code: "ER" },
      { name: "Estonia", code: "EE" },
      { name: "Ethiopia", code: "ET" },
      { name: "Falkland Islands (Malvinas)", code: "FK" },
      { name: "Faroe Islands", code: "FO" },
      { name: "Fiji", code: "FJ" },
      { name: "Finland", code: "FI" },
      { name: "France", code: "FR" },
      { name: "French Guiana", code: "GF" },
      { name: "French Polynesia", code: "PF" },
      { name: "French Southern Territories", code: "TF" },
      { name: "Gabon", code: "GA" },
      { name: "Gambia", code: "GM" },
      { name: "Georgia", code: "GE" },
      { name: "Germany", code: "DE" },
      { name: "Ghana", code: "GH" },
      { name: "Gibraltar", code: "GI" },
      { name: "Greece", code: "GR" },
      { name: "Greenland", code: "GL" },
      { name: "Grenada", code: "GD" },
      { name: "Guadeloupe", code: "GP" },
      { name: "Guam", code: "GU" },
      { name: "Guatemala", code: "GT" },
      { name: "Guernsey", code: "GG" },
      { name: "Guinea", code: "GN" },
      { name: "Guinea-Bissau", code: "GW" },
      { name: "Guyana", code: "GY" },
      { name: "Haiti", code: "HT" },
      { name: "Heard Island and Mcdonald Islands", code: "HM" },
      { name: "Holy See (Vatican City State)", code: "VA" },
      { name: "Honduras", code: "HN" },
      { name: "Hong Kong", code: "HK" },
      { name: "Hungary", code: "HU" },
      { name: "Iceland", code: "IS" },
      { name: "India", code: "IN" },
      { name: "Indonesia", code: "ID" },
      { name: "Iran, Islamic Republic Of", code: "IR" },
      { name: "Iraq", code: "IQ" },
      { name: "Ireland", code: "IE" },
      { name: "Isle of Man", code: "IM" },
      { name: "Israel", code: "IL" },
      { name: "Italy", code: "IT" },
      { name: "Jamaica", code: "JM" },
      { name: "Japan", code: "JP" },
      { name: "Jersey", code: "JE" },
      { name: "Jordan", code: "JO" },
      { name: "Kazakhstan", code: "KZ" },
      { name: "Kenya", code: "KE" },
      { name: "Kiribati", code: "KI" },
      { name: "Democratic People's Republic of Korea", code: "KP" },
      { name: "Korea, Republic of", code: "KR" },
      { name: "Kosovo", code: "XK" },
      { name: "Kuwait", code: "KW" },
      { name: "Kyrgyzstan", code: "KG" },
      { name: "Lao People's Democratic Republic", code: "LA" },
      { name: "Latvia", code: "LV" },
      { name: "Lebanon", code: "LB" },
      { name: "Lesotho", code: "LS" },
      { name: "Liberia", code: "LR" },
      { name: "Libyan Arab Jamahiriya", code: "LY" },
      { name: "Liechtenstein", code: "LI" },
      { name: "Lithuania", code: "LT" },
      { name: "Luxembourg", code: "LU" },
      { name: "Macao", code: "MO" },
      { name: "Macedonia, The Former Yugoslav Republic of", code: "MK" },
      { name: "Madagascar", code: "MG" },
      { name: "Malawi", code: "MW" },
      { name: "Malaysia", code: "MY" },
      { name: "Maldives", code: "MV" },
      { name: "Mali", code: "ML" },
      { name: "Malta", code: "MT" },
      { name: "Marshall Islands", code: "MH" },
      { name: "Martinique", code: "MQ" },
      { name: "Mauritania", code: "MR" },
      { name: "Mauritius", code: "MU" },
      { name: "Mayotte", code: "YT" },
      { name: "Mexico", code: "MX" },
      { name: "Micronesia, Federated States of", code: "FM" },
      { name: "Moldova, Republic of", code: "MD" },
      { name: "Monaco", code: "MC" },
      { name: "Mongolia", code: "MN" },
      { name: "Montenegro", code: "ME" },
      { name: "Montserrat", code: "MS" },
      { name: "Morocco", code: "MA" },
      { name: "Mozambique", code: "MZ" },
      { name: "Myanmar", code: "MM" },
      { name: "Namibia", code: "NA" },
      { name: "Nauru", code: "NR" },
      { name: "Nepal", code: "NP" },
      { name: "Netherlands", code: "NL" },
      { name: "Netherlands Antilles", code: "AN" },
      { name: "New Caledonia", code: "NC" },
      { name: "New Zealand", code: "NZ" },
      { name: "Nicaragua", code: "NI" },
      { name: "Niger", code: "NE" },
      { name: "Nigeria", code: "NG" },
      { name: "Niue", code: "NU" },
      { name: "Norfolk Island", code: "NF" },
      { name: "Northern Mariana Islands", code: "MP" },
      { name: "Norway", code: "NO" },
      { name: "Oman", code: "OM" },
      { name: "Pakistan", code: "PK" },
      { name: "Palau", code: "PW" },
      { name: "Palestinian Territory, Occupied", code: "PS" },
      { name: "Panama", code: "PA" },
      { name: "Papua New Guinea", code: "PG" },
      { name: "Paraguay", code: "PY" },
      { name: "Peru", code: "PE" },
      { name: "Philippines", code: "PH" },
      { name: "Pitcairn", code: "PN" },
      { name: "Poland", code: "PL" },
      { name: "Portugal", code: "PT" },
      { name: "Puerto Rico", code: "PR" },
      { name: "Qatar", code: "QA" },
      { name: "Reunion", code: "RE" },
      { name: "Romania", code: "RO" },
      { name: "Russian Federation", code: "RU" },
      { name: "Rwanda", code: "RW" },
      { name: "Saint Helena", code: "SH" },
      { name: "Saint Kitts and Nevis", code: "KN" },
      { name: "Saint Lucia", code: "LC" },
      { name: "Saint Pierre and Miquelon", code: "PM" },
      { name: "Saint Vincent and the Grenadines", code: "VC" },
      { name: "Samoa", code: "WS" },
      { name: "San Marino", code: "SM" },
      { name: "Sao Tome and Principe", code: "ST" },
      { name: "Saudi Arabia", code: "SA" },
      { name: "Senegal", code: "SN" },
      { name: "Serbia", code: "RS" },
      { name: "Seychelles", code: "SC" },
      { name: "Sierra Leone", code: "SL" },
      { name: "Singapore", code: "SG" },
      { name: "Slovakia", code: "SK" },
      { name: "Slovenia", code: "SI" },
      { name: "Solomon Islands", code: "SB" },
      { name: "Somalia", code: "SO" },
      { name: "South Africa", code: "ZA" },
      { name: "South Georgia and the South Sandwich Islands", code: "GS" },
      { name: "Spain", code: "ES" },
      { name: "Sri Lanka", code: "LK" },
      { name: "Sudan", code: "SD" },
      { name: "Suriname", code: "SR" },
      { name: "Svalbard and Jan Mayen", code: "SJ" },
      { name: "Swaziland", code: "SZ" },
      { name: "Sweden", code: "SE" },
      { name: "Switzerland", code: "CH" },
      { name: "Syrian Arab Republic", code: "SY" },
      { name: "Taiwan", code: "TW" },
      { name: "Tajikistan", code: "TJ" },
      { name: "Tanzania, United Republic of", code: "TZ" },
      { name: "Thailand", code: "TH" },
      { name: "Timor-Leste", code: "TL" },
      { name: "Togo", code: "TG" },
      { name: "Tokelau", code: "TK" },
      { name: "Tonga", code: "TO" },
      { name: "Trinidad and Tobago", code: "TT" },
      { name: "Tunisia", code: "TN" },
      { name: "Turkey", code: "TR" },
      { name: "Turkmenistan", code: "TM" },
      { name: "Turks and Caicos Islands", code: "TC" },
      { name: "Tuvalu", code: "TV" },
      { name: "Uganda", code: "UG" },
      { name: "Ukraine", code: "UA" },
      { name: "United Arab Emirates", code: "AE" },
      { name: "United Kingdom", code: "GB" },
      { name: "United States", code: "US" },
      { name: "United States Minor Outlying Islands", code: "UM" },
      { name: "Uruguay", code: "UY" },
      { name: "Uzbekistan", code: "UZ" },
      { name: "Vanuatu", code: "VU" },
      { name: "Venezuela", code: "VE" },
      { name: "Viet Nam", code: "VN" },
      { name: "Virgin Islands, British", code: "VG" },
      { name: "Virgin Islands, U.S.", code: "VI" },
      { name: "Wallis and Futuna", code: "WF" },
      { name: "Western Sahara", code: "EH" },
      { name: "Yemen", code: "YE" },
      { name: "Zambia", code: "ZM" },
      { name: "Zimbabwe", code: "ZW" }
    ];

    function getCountries(){
      return countries;
    }

    function getStates(){
      return states;
    }

    function simulateLeads(){
      var deferred = $q.defer();
      $timeout(function(){
        var item = {
            folio: '12345',
            client: 'Luis Perez Bautista',
            email: 'luisperez@gmail.com',
            cotizacion: '29-abr-2016',
            seguimiento: '25-jun-2016',
            total: '$14,699',
            cobrado: '$7,699',
            diferencia: '$7,000'
        };
        var items = [];
        for(var i=0;i<4;i++){
          items.push(item);
        }

        var data = {
          data: items,
          total: 10
        };
        deferred.resolve({data:data});
      },1000);
      return deferred.promise;
    }

    function simulateOrders(){
      var deferred = $q.defer();
      $timeout(function(){
        var item = {
            folio: '12345',
            client: 'Luis Perez Bautista',
            cotizacion: '29-abr-2016',
            entrega: '25-jun-2016',
            dias: '8',
            total: '$14,699',
            cobrado: '$7,699',
            diferencia: '$7,000'
        };
        var items = [];
        for(var i=0;i<4;i++){
          item.folio = item.folio + i;
          items.push(item);
        }
        var data = {
          data: items,
          total: 10
        };
        deferred.resolve({data:data});
      },1000);
      return deferred.promise;
    }

    function simulateClients(){
      var deferred = $q.defer();
      $timeout(function(){
        var item = {
          id: '12345',
          client: 'Luis Perez Bautista',
          rfc: 'PEBL071394',
          email: 'luisperez@gmail.com',
          telefono: '(998) 848483',
          alta: '23-Jun-2016',
        };
        var items = [];
        for(var i=0;i<4;i++){
          items.push(item);
        }
        var data = {
          data: items,
          total: 10
        };
        deferred.resolve({data:data});
      },1000);
      return deferred.promise;
    }

    function dialogController($scope, $mdDialog){
      $scope.closeDialog = function (){
          $mdDialog.hide();
      };
    }

    function showDialog(message, parent, ev){
      var parentCon = angular.element('body');
      if(parent){
        parentCon = angular.element(parent);
      }

      $mdDialog.show(
        $mdDialog.alert()
          .parent(parentCon)
          .clickOutsideToClose(true)
          .title(message)
          //.textContent('You can specify some description text in here.')
          .ariaLabel(message)
          .ok('Aceptar')
          .targetEvent(ev)
      );
    }

    function getPaymentMethods(){
      return paymentGroups;
    }

    function getMonthDateRange() {
      var currentTime = new Date()
      // returns the month (from 0 to 11)
      var month = currentTime.getMonth() + 1
      // returns the year (four digits)
      var year = currentTime.getFullYear()
      var startDate = moment([year, month]).add(-1,"month");
      // Clone the value before .endOf()
      var endDate = moment(startDate).endOf('month');
      // make sure to call toDate() for plain JavaScript date type
      return { start: startDate.toDate(), end: endDate.toDate() };
    }

    function combineDateTime(date, time, seconds){
      var date = moment(date);
      time = moment(time);
      date = date.set({
         'hour' : time.get('hour'),
         'minute'  : time.get('minute'),
         'second' : seconds || time.get('second')
      });
      return date.toDate();
    }

    var service = {
      combineDateTime: combineDateTime,
      getCountries: getCountries,
      getStates: getStates,
      getPaymentMethods: getPaymentMethods,
      getMonthDateRange: getMonthDateRange,
      simulateOrders: simulateOrders,
      simulateLeads: simulateLeads,
      simulateClients: simulateClients,
      showDialog: showDialog
    };

    return service;

  }

})();
