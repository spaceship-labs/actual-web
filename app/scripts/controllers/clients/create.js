'use strict';

/**
 * @ngdoc function
 * @name dashexampleApp.controller:ClientCreateCtrl
 * @description
 * # ClientCreateCtrl
 * Controller of the dashexampleApp
 */
angular.module('dashexampleApp')
  .controller('ClientCreateCtrl', ClientCreateCtrl);

function ClientCreateCtrl(
    $location, 
    $rootScope, 
    dialogService, 
    commonService, 
    clientService,
    quotationService,
    localStorageService){
  var vm = this;

  angular.extend(vm, {
    activeTab       : 0,
    client          :{},
    contacts        :[{}],
    fiscalAddress   :{},
    titles: [
      {label:'Sr.', value:'Sr'},
      {label:'Sra.', value: 'Sra'},
      {label: 'Srita.', value: 'Srita'}
    ],
    genders: [
      {label:'Masculino', value: 'M'},
      {label: 'Femenino', value: 'F'}
    ],
    states          : [],
    countries       : commonService.getCountries(),
    addContactForm  : addContactForm,
    create          : create,
    onPikadaySelect : onPikadaySelect
  });

  function onPikadaySelect(pikaday){
    vm.client.Birthdate = pikaday._d;
  }

  function addContactForm(){
    vm.contacts.push({});
  }

  function addContact(form){
    if(form.$valid){
      vm.contacts.push({});
    }else{
      dialogService.showDialog('Campos incompletos');
    }
  }

  function init(){
    commonService.getStatesSap().then(function(res){
      vm.states = res.data;
    })
    .catch(function(err){
      console.log(err);
    });
  }


  function filterContacts(contact){
    return !_.isUndefined(contact.FirstName);
  }

  function validateClientEmails(client){
    if(client.contacts && client.contacts.length > 0){
      for(var i=0;i<client.contacts.length;i++){
        if(
          !commonService.isValidEmail(client.contacts[i].E_Mail, {excludeActualDomains: true}) && 
          !_.isEmpty(client.fiscalAddress)
        ){
          return false;
        }
      }
    }

    if(client.fiscalAddress && !_.isEmpty(client.fiscalAddress) ){
      if(!commonService.isValidEmail(client.fiscalAddress.U_Correos, {excludeActualDomains: true})){
        return false;
      }
    }

    if(!commonService.isValidEmail(client.E_Mail, {excludeActualDomains: true})){
      return false;
    }

    return true;
  }


  function getFilledForms(formsRelations){
    var filledForms = formsRelations.reduce(function(acum, formRelation){
      if( angular.isArray(formRelation.data) ){
        var areFilled = false;
        for(var i = 0; i<formRelation.data.length; i++){
          if( !_.isEmpty(formRelation.data[i]) ){
            areFilled = true;
          }
        }
        if(areFilled){
          console.log('pushing array form');
          acum.push(formRelation.form);
        }
      }
      else if( !_.isEmpty(formRelation.data) ){
        console.log('pushing normal form');
        acum.push(formRelation.form);
      }
      return acum;
    },[]);
    return filledForms;
  }

  function areFormsValid(forms){
    if(forms.length > 0){
      var validFlag = true;
      for(var i=0;i<forms.length;i++){
        if(!forms[i].$valid){
          validFlag = false;
        }
      }
      return validFlag;
    }
    return true;
  }

  function create(createPersonalForm, createFiscalForm, createDeliveryForm){
    vm.isLoading = true;
    vm.client.contacts = vm.contacts.filter(filterContacts);
    vm.client.fiscalAddress = vm.fiscalAddress || false;
    var formsRelations = [
      {form: createFiscalForm, data: vm.client.fiscalAddress},
      {form: createDeliveryForm, data: vm.client.contacts}      
    ];
    var areValidEmails = validateClientEmails(vm.client);
    var filledForms = getFilledForms(formsRelations);
    if(areFormsValid(filledForms) && createPersonalForm.$valid && areValidEmails){
      clientService.create(vm.client)
        .then(function(res){
          console.log(res);
          var created = res.data;
          vm.isLoading = false;
          if(created.CardCode){
            var isInCheckoutProcess = localStorageService.get('inCheckoutProcess');
            if($location.search().continueQuotation || isInCheckoutProcess){
              assignClientToQuotation(created.id);
            }else{
              $location
                .path('/clients/profile/'+created.id)
                .search({createdClient:true});
            }
          }
        })
        .catch(function(err){
          console.log(err);
          vm.isLoading = false;
          dialogService.showDialog('Hubo un error: ' + (err.data || err) );
        });
    }
    else if(!areValidEmails){
      vm.isLoading = false;
      dialogService.showDialog('Emails no validos');
    }else{
      vm.isLoading = false;
      dialogService.showDialog('Datos incompletos');
    }

  }

  function assignClientToQuotation(clientId){
    var params = {Client: clientId};
    var activeQuotation = $rootScope.activeQuotation;
    if(activeQuotation.id){
      quotationService.update(activeQuotation.id, params)
      .then(function(res){
        var quotation = res.data;
        if(quotation && quotation.id){
          quotationService.setActiveQuotation(activeQuotation.id);
          localStorageService.remove('inCheckoutProcess');
          $location
            .path('/quotation/edit/' + activeQuotation.id)
            .search({createdClient:true});        
        }
      })
      .catch(function(err){
        console.log('err', err);
      });
    }
  }

  init();

}
