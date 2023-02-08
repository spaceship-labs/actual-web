(function() {
  'use strict';

  angular.module('actualWebApp').factory('clientService', clientService);

  /** @ngInject */
  function clientService($http, $q, $rootScope, api) {
    var GENERIC_RFC = 'XAXX010101000';
    var DATE_REGEX =
      '(\\d{2}((01|03|05|07|08|10|12)(0[1-9]|[12]\\d|3[01])|02(0[1-9]|[12]\\d)|(04|06|09|11)(0[1-9]|[12]\\d|30)))';
    var RFC_VALIDATION_REGEX = new RegExp(
      '^(([A-Z]{3,4})' + DATE_REGEX + '([A-Z|\\d]{3}))$'
    );

    var service = {
      buildAddressStringByContact: buildAddressStringByContact,
      register: register,
      search: search,
      getEwalletById: getEwalletById,
      getBalanceById: getBalanceById,
      getFiscalAddress: getFiscalAddress,
      getTitles: getTitles,
      getGenders: getGenders,
      isClientFiscalDataValid: isClientFiscalDataValid,
      setClientDefaultData: setClientDefaultData,
      updateFiscalAddress: updateFiscalAddress,
      getCFDIUseList: getCFDIUseList,
      mapCFDIuseCode: mapCFDIuseCode,
      fiscalAddressConstraints: {
        LicTradNum: { min: 12, max: 13 },
        companyName: { max: 50 },
        Street: { max: 100 },
        U_NumExt: { max: 20 },
        U_NumInt: { max: 20 },
        Block: { max: 100 }
      },
      validateRfc: validateRfc,
      GENERIC_RFC: GENERIC_RFC,
      RFC_VALIDATION_REGEX: RFC_VALIDATION_REGEX,

      getCFDIUseListLegalPerson : getCFDIUseListLegalPerson,
      getCFDIUseListNaturalPerson : getCFDIUseListNaturalPerson,
      getRegimesLegalPerson : getRegimesLegalPerson,
      getRegimesNaturalPerson : getRegimesNaturalPerson,
    };

    return service;

    function search(page, params) {
      var p = page || 1;
      var url = '/client/find/';
      return api.$http.post(url, params);
    }

    function create(params) {
      var url = '/client/create/';
      return api.$http.post(url, params).then(function(res) {
        return res.data;
      });
    }

    function register(params) {
      var url = '/client/register/';
      return api.$http.post(url, params).then(function(res) {
        return res.data;
      });
    }
    function getFiscalAddress(cardCode) {
      var url = '/client/' + cardCode + '/fiscaladdress';
      return api.$http.get(url).then(function(res) {
        return res.data;
      });
    }

    function updateFiscalAddress(id, cardCode, params) {
      var url = '/client/' + cardCode + '/fiscaladdress';
      return api.$http.put(url, params);
    }

    function getEwalletById(clientId) {
      var url = '/client/' + clientId + '/ewallet';
      return api.$http.get(url);
    }

    function getBalanceById(clientId) {
      var url = '/client/' + clientId + '/balance';
      return api.$http.get(url);
    }

    function buildAddressStringByContact(contact) {
      var address = '';
      address += 'Calle: ' + contact.Address;
      address += contact.U_Noexterior
        ? ', no. exterior: ' + contact.U_Noexterior
        : null;
      address += contact.U_Nointerior
        ? ', no. interior: ' + contact.U_Nointerior
        : null;
      address += contact.U_Colonia ? ', colonia: ' + contact.U_Colonia : null;
      address += contact.U_Mpio ? ', municipio: ' + contact.U_Mpio : null;
      address += contact.U_Ciudad ? ', ciudad: ' + contact.U_Ciudad : null;
      address += contact.U_Estado ? ', estado: ' + contact.U_Estado : null;
      address += contact.U_CP ? ', código postal: ' + contact.U_CP : null;
      address += contact.U_Estado ? ', estado: ' + contact.U_Estado : null;
      address += contact.U_Entrecalle
        ? ', entre calle: ' + contact.U_Entrecalle
        : null;
      address += contact.U_Ycalle ? ' y calle: ' + contact.U_Ycalle : null;
      address += contact.U_Notes1 ? ', referencias: ' + contact.U_Notes1 : null;
      return address;
    }

    function isClientFiscalDataValid(client) {
      if (client && client.FiscalAddress) {
        return (
          client.LicTradNum &&
          client.FiscalAddress.companyName &&
          client.FiscalAddress.companyName != ''
        );
      }
      return false;
    }

    function setClientDefaultData(client) {
      if (!client.FiscalAddress) {
        client.FiscalAddress = {};
      }
      if (!client.FiscalAddress.U_Correos) {
        client.FiscalAddress.U_Correos = angular.copy(client.E_Mail);
      }

      /*
        client.Contacts = client.Contacts.map(function(contact){
          if(!contact.E_Mail){
            contact.E_Mail = angular.copy(client.E_Mail);
          }
          if(!contact.FirstName){
            contact.FirstName = angular.copy(client.CardName);
          }
          if(!contact.Tel1){
            contact.Tel1 = angular.copy(client.Phone1);
          }
          if(!contact.Cellolar){
            contact.Cellolar = angular.copy(client.Cellular);
          }
          contact.editEnabled = false;

          return contact;
        });
        */

      return client;
    }

    function getTitles() {
      var titles = [
        { label: 'Sr.', value: 'Sr' },
        { label: 'Sra.', value: 'Sra' },
        { label: 'Srita.', value: 'Srita' }
      ];
      return titles;
    }

    function getGenders() {
      var genders = [
        { label: 'Masculino', value: 'M' },
        { label: 'Femenino', value: 'F' }
      ];
      return genders;
    }

    function validateRfc(rfc, genericRFC, rfcValidationRegex) {
      genericRFC = genericRFC || GENERIC_RFC;
      rfcValidationRegex = rfcValidationRegex || RFC_VALIDATION_REGEX;
      if (rfc === genericRFC) {
        return true;
      }
      var result = (rfc || '').match(rfcValidationRegex);
      if (_.isArray(result)) {
        return true;
      }
      return false;
    }

    function mapCFDIuseCode(code) {
      var cfdiUse = {};
      var list = getCFDIUseList();
      cfdiUse = _.findWhere(list, { code: code });
      return cfdiUse || {};
    }

    function getCFDIUseList() {
      var list = [
        {
          code: 'G01',
          label: 'Adquisición de mercancias',
          isMoral: true
        },
        {
          code: 'G02',
          label: 'Devoluciones, descuentos o bonificaciones',
          isMoral: true
        },
        {
          code: 'G03',
          label: 'Gastos en general',
          isMoral: true
        },
        {
          code: 'I01',
          label: 'Construcciones',
          isMoral: true
        },
        {
          code: 'I02',
          label: 'Mobilario y equipo de oficina por inversiones',
          isMoral: true
        },
        {
          code: 'I03',
          label: 'Equipo de transporte',
          isMoral: true
        },
        {
          code: 'I04',
          label: 'Equipo de computo y accesorios',
          isMoral: true
        },
        {
          code: 'I05',
          label: 'Dados, troqueles, moldes, matrices y herramental',
          isMoral: true
        },
        {
          code: 'I06',
          label: 'Comunicaciones telefónicas',
          isMoral: true
        },
        {
          code: 'I07',
          label: 'Comunicaciones satelitales',
          isMoral: true
        },
        {
          code: 'I08',
          label: 'Otra maquinaria y equipo',
          isMoral: true
        },
        {
          code: 'D01',
          label: 'Honorarios médicos, dentales y gastos hospitalarios',
          isMoral: false
        },
        {
          code: 'D02',
          label: 'Gastos médicos por incapacidad o discapacidad',
          isMoral: false
        },
        {
          code: 'D03',
          label: 'Gastos funerales',
          isMoral: false
        },
        {
          code: 'D04',
          label: 'Donativos',
          isMoral: false
        },
        {
          code: 'D05',
          label:
            'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)',
          isMoral: false
        },
        {
          code: 'D06',
          label: 'Aportaciones voluntarias al SAR',
          isMoral: false
        },
        {
          code: 'D07',
          label: 'Primas por seguros de gastos médicos',
          isMoral: false
        },
        {
          code: 'D08',
          label: 'Gastos de transportación escolar obligatoria',
          isMoral: false
        },
        {
          code: 'D09',
          label:
            'Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones',
          isMoral: false
        },
        {
          code: 'D10',
          label: 'Pagos por servicios educativos (colegiaturas)',
          isMoral: false
        },
        {
          code: "S01",
          label: "Sin efectos fiscales.",
          isMoral: true
        },
        {
          code: "CP01",
          label: "Pagos",
          isMoral: true
        },
        {
          code: "CN01",
          label: "Nómina",
          isMoral: false
        }
      ];

      return list;
    }

    function getCFDIUseListLegalPerson() {
      var list = [
        {
          code: 'G01',
          label: 'Adquisición de mercancias',
          isMoral: true
        },
        {
          code: 'G02',
          label: 'Devoluciones, descuentos o bonificaciones',
          isMoral: true
        },
        {
          code: 'G03',
          label: 'Gastos en general',
          isMoral: true
        },
        {
          code: 'I01',
          label: 'Construcciones',
          isMoral: true
        },
        {
          code: 'I02',
          label: 'Mobilario y equipo de oficina por inversiones',
          isMoral: true
        },
        {
          code: 'I03',
          label: 'Equipo de transporte',
          isMoral: true
        },
        {
          code: 'I04',
          label: 'Equipo de computo y accesorios',
          isMoral: true
        },
        {
          code: 'I05',
          label: 'Dados, troqueles, moldes, matrices y herramental',
          isMoral: true
        },
        {
          code: 'I06',
          label: 'Comunicaciones telefónicas',
          isMoral: true
        },
        {
          code: 'I07',
          label: 'Comunicaciones satelitales',
          isMoral: true
        },
        {
          code: 'I08',
          label: 'Otra maquinaria y equipo',
          isMoral: true
        },
        {
          code: "S01",
          label: "Sin efectos fiscales.",
          isMoral: true
        },
        {
          code: "CP01",
          label: "Pagos",
          isMoral: true
        }
      ];
      return list;
    }

    function getCFDIUseListNaturalPerson() {
      var list = [
        {
          code: 'G01',
          label: 'Adquisición de mercancias',
          isMoral: true
        },
        {
          code: 'G02',
          label: 'Devoluciones, descuentos o bonificaciones',
          isMoral: true
        },
        {
          code: 'G03',
          label: 'Gastos en general',
          isMoral: true
        },
        {
          code: 'I01',
          label: 'Construcciones',
          isMoral: true
        },
        {
          code: 'I02',
          label: 'Mobilario y equipo de oficina por inversiones',
          isMoral: true
        },
        {
          code: 'I03',
          label: 'Equipo de transporte',
          isMoral: true
        },
        {
          code: 'I04',
          label: 'Equipo de computo y accesorios',
          isMoral: true
        },
        {
          code: 'I05',
          label: 'Dados, troqueles, moldes, matrices y herramental',
          isMoral: true
        },
        {
          code: 'I06',
          label: 'Comunicaciones telefónicas',
          isMoral: true
        },
        {
          code: 'I07',
          label: 'Comunicaciones satelitales',
          isMoral: true
        },
        {
          code: 'I08',
          label: 'Otra maquinaria y equipo',
          isMoral: true
        },
        {
          code: 'D01',
          label: 'Honorarios médicos, dentales y gastos hospitalarios',
          isMoral: false
        },
        {
          code: 'D02',
          label: 'Gastos médicos por incapacidad o discapacidad',
          isMoral: false
        },
        {
          code: 'D03',
          label: 'Gastos funerales',
          isMoral: false
        },
        {
          code: 'D04',
          label: 'Donativos',
          isMoral: false
        },
        {
          code: 'D05',
          label:
            'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)',
          isMoral: false
        },
        {
          code: 'D06',
          label: 'Aportaciones voluntarias al SAR',
          isMoral: false
        },
        {
          code: 'D07',
          label: 'Primas por seguros de gastos médicos',
          isMoral: false
        },
        {
          code: 'D08',
          label: 'Gastos de transportación escolar obligatoria',
          isMoral: false
        },
        {
          code: 'D09',
          label:
            'Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones',
          isMoral: false
        },
        {
          code: 'D10',
          label: 'Pagos por servicios educativos (colegiaturas)',
          isMoral: false
        },
        {
          code: "S01",
          label: "Sin efectos fiscales.",
          isMoral: true
        },
        {
          code: "CP01",
          label: "Pagos",
          isMoral: true
        },
        {
          code: "CN01",
          label: "Nómina",
          isMoral: false
        }
      ];
      return list;
    }

    function getRegimesLegalPerson() {
      var list = [
        {
          code: 'GENERAL_REGIME_OF_MORAL_PEOPLE_LAW',
          label: 'Régimen General de Ley Personas Morales',
        },
        {
          code: 'REGIME_OF_MORAL_PEOPLE_NOT_PROFIT',
          label: 'Régimen de las Personas Morales con Fines No Lucrativos',
        },
        {
          code: 'REGIME_OF_COOPERATIVE_PRODUCTION_SOCIETIES',
          label: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos',
        },
        {
          code: 'PRIMARY_SECTOR_REGIME',
          label: 'Régimen de Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
        },
        {
          code: 'SOCIETIES_OPTIONAL_REGIME',
          label: 'Régimen Opcional para Grupos de Sociedades',
        },
        {
          code: 'REGIME_OF_THE_COORDINATED',
          label: 'Régimen de los Coordinados',
        },
        {
          code: 'REGIME_OF_TRUST',
          label: 'Régimen simplificado de confianza (RESICO)',
        },
        /* {
          code: 'FEES_REGIME',
          label: 'Régimen honorarios (servicios profesionales)',
        }, */
        {
          code: 'NO_REGIME',
          label: 'Sin régimen',
        }
      ]
      return list;
    }

    function getRegimesNaturalPerson() {
      var list = [
        {
          code: 'SALARIED_REGIME',
          label: 'Sueldos y Salarios e Ingresos Asimilados a Salarios',
        },
        {
          code: 'LEASEHOLD_REGIME',
          label: 'Régimen de arrendamiento',
        },
        {
          code: "DIVIDEND_INCOME",
          label: "Ingresos por Dividendos (socios y accionistas)",
        },
        {
          code: 'BUSINESS_ACTIVITIES_REGIME',
          label: 'Personas Físicas con Actividades Empresariales y Profesionales',
        },
        {
          code: 'SIMPLIFIED_REGIME',
          label: 'Sin obligaciones fiscales',
        },
        {
          code: 'FISCAL_INCORPORATION_REGIME',
          label: 'Régimen de Incorporación Fiscal',
        },
        {
          code: 'REGIME_OF_THE_TECHNOLOGICAL_PLATFORMS_INCOME_ACTIVITIES',
          label: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
        },
        {
          code: 'REGIME_OF_TRUST',
          label: 'Régimen simplificado de confianza (RESICO)',
        },
        /* {
          code: 'FEES_REGIME',
          label: 'Régimen honorarios (servicios profesionales)',
        }, */
        {
          code: 'NO_REGIME',
          label: 'Sin régimen',
        }
      ]

      return list;
    }
  }
})();
