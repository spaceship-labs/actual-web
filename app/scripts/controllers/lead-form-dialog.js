function LeadFormDialogController($mdDialog, leadService, params) {
  'use strict';

  var ctrl = this;
  ctrl.lead = {};
  ctrl.submit = submit;
  ctrl.isLoading = false;

  function submit($form){
    if($form.$valid){
      ctrl.isLoading = true;
      var createParams = ctrl.lead;
      createParams.quotationId = params.quotationId;
      leadService.createLeadAndSendQuotation(createParams)
        .then(function(res){
          $mdDialog.hide(res);
        })
        .catch(function(err){
          ctrl.isLoading = false;
          ctrl.errMessage = 'Hubo un error al enviar la información';
          console.log('err', err);
        });

    }else{
      ctrl.errMessage = 'Datos incompletos';
    }
  }
}
