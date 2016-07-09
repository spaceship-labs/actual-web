(function ()
{
    'use strict';

    angular
        .module('dashexampleApp')
        .factory('dialogService', dialogService);

    function dialogController($scope, $mdDialog){
      $scope.closeDialog = function (){
          $mdDialog.hide();
      };
    }

    dialogController.$inject = ['$scope','$mdDialog'];

    /** @ngInject */
    function dialogService($q, $log, $mdDialog, $window, $location, $rootScope, $mdToast){
        var service = {
            showDialog: showDialog,
            showDestroyDialog: showDestroyDialog,
            showMessageDialog: showMessageDialog,
            showErrorMessage: showErrorMessage
        };

        return service;

        function showDialog(message, parent, ev){
          var parentCon = angular.element('body');
          if(parent){
            parentCon = angular.element(parent);
          }

          // Show the sent data.. you can delete this safely.
          $mdDialog.show({
              controller: dialogController,
              template           : '<md-dialog>' +
              '  <md-dialog-content><h1>' + message + '</h1></md-dialog-content>' +
              '  <md-dialog-actions>' +
              '    <md-button ng-click="closeDialog()" class="md-primary">' +
              '      Aceptar' +
              '    </md-button>' +
              '  </md-dialog-actions>' +
              '</md-dialog>',
              parent             : parentCon,
              targetEvent        : ev,
              clickOutsideToClose: true
          });
        }


        function showErrorMessage(message, errors, parent, ev){
          var parentCon = angular.element('body');
          if(parent){
            parentCon = angular.element(parent);
          }
          var errorsHtml = '';
          errors.forEach(function(error){
            errorsHtml += '<li>'+error+'</li>';
          });

          // Show the sent data.. you can delete this safely.
          $mdDialog.show({
              controller: dialogController,
              template           : '<md-dialog>' +
              '  <md-dialog-content>' +
                '<h1>' + message + '</h1>' + errorsHtml +
              '</md-dialog-content>' +
              '  <md-dialog-actions>' +
              '    <md-button ng-click="closeDialog()" class="md-primary">' +
              '      Aceptar' +
              '    </md-button>' +
              '  </md-dialog-actions>' +
              '</md-dialog>',
              parent             : parentCon,
              targetEvent        : ev,
              clickOutsideToClose: true
          });
        }

        function showDestroyDialog(ev, destroyPromise,id, redirectUrl, isPromise, loadingFlag){
          var redirectPath = redirectUrl || false;
          var deferred = $q.defer();
          var confirm = $mdDialog.confirm()
                .title('Eliminar')
                .textContent('¿Deseas eliminar este registro?')
                .ariaLabel('Eliminar')
                .targetEvent(ev)
                .ok('Eliminar')
                .cancel('Cancelar');
          $mdDialog.show(confirm).then(function() {
            $rootScope.$emit('destroyingItemStart', true);
            loadingFlag = true;
            destroyPromise(id).then(
              function(res){
                loadingFlag = false;
                $rootScope.$emit('destroyingItemEnd', true);

                if(isPromise){
                  deferred.resolve({destroyed:true});
                }
                else{
                  if(redirectPath){
                    $location.path(redirectPath);
                  }
                  else{
                    $window.location.reload();
                  }
                }
              },
              function(err){
                $rootScope.$emit('destroyingItemEnd', true);
                console.log(err);
                deferred.reject(err);
              }
            );
          }, function() {
            console.log('Cancelado');
          });

          if(isPromise){
            return deferred.promise;
          }

        }

        function showMessageDialog(message){
          var last = {
              bottom: false,
              top: true,
              left: false,
              right: true
            };
          var toastPosition = angular.extend({},last);
          var getToastPosition = function() {
            sanitizePosition();
            return Object.keys(toastPosition)
              .filter(function(pos) { return toastPosition[pos]; })
              .join(' ');
          }

          function sanitizePosition() {
            var current = toastPosition;
            if ( current.bottom && last.top ){ current.top = false;}
            if ( current.top && last.bottom ){ current.bottom = false;}
            if ( current.right && last.left ){ current.left = false;}
            if ( current.left && last.right ){ current.right = false;}
            last = angular.extend({},current);
          }



          var pinTo = getToastPosition();
          $mdToast.show(
            $mdToast.simple()
              .textContent(message)
              .position(pinTo )
              .hideDelay(3000)
          );



        }

    }

})();
