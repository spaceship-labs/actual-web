(function ()
{
    'use strict';

    angular
        .module('dashexampleApp')
        .directive('tableList', tableList);

    var controller = function($scope, $rootScope, DTOptionsBuilder, DTColumnBuilder, dialogService, $compile){
      $scope.dtInstance = {};

      $scope.showDestroyDialog = function(ev, id){
        console.log('showDestroyDialog');
        dialogService.showDestroyDialog(ev, $scope.destroyFn, id);
      };

      $scope.dtOptions = DTOptionsBuilder
        .newOptions()
        .withFnServerData(serverData)
        .withDataProp('data')
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withOption('paging', true)
        .withOption('responsive',true)
        .withOption('autoWidth',true)
        .withOption('displayLength', 10)
        .withOption('bLengthChange',false)
        .withOption('paging', false)
        //.withPaginationType('numbers')
        .withDOM('<"top"f>rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>')
        .withOption('createdRow', function(row) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        })
        .withOption('initComplete', function() {
          $('<p class="sorting-by-label"></p>').appendTo('.dataTables_wrapper .top');
          //$('.dataTables_wrapper .top .sorting-by-label').text('Ordenado por: '+ $scope.columns[0].label);

          //$('.table-list-wrap label').text('');
          if($('#new-search').length <= 0){
            $('<button/>').text('Buscar').attr('id', 'new-search').appendTo('.dataTables_filter');
            $('.dataTables_filter input').unbind();
            $('.dataTables_filter input').keypress(function(e){
              if(e.which == 10 || e.which == 13) {
                $scope.dtInstance.DataTable.search($('.dataTables_filter input').val()).draw();
              }
            });
            $('#new-search').on('click', function() {
                $scope.dtInstance.DataTable.search($('.dataTables_filter input').val()).draw();
            });
          }

        });

      function serverData(sSource, aoData, fnCallback, oSettings) {
        console.log('en serverData');

        //All the parameters you need is in the aoData variable
        var draw = aoData[0].value;
        var columns = aoData[1].value;
        var start = aoData[3].value;
        var length = aoData[4].value;
        var search = aoData[5].value;
        var page = 0;
        var query = {};
        var sorting = oSettings.aaSorting[0];

        var sortingColumnIndex = sorting[0];
        var sortingColumnLabel = $scope.columns[sortingColumnIndex].label;
        var sortingColumnName = columns[sortingColumnIndex].data;
        var sortingDirection = sorting[1].toUpperCase();

        page = (start===0) ? 1 : (start/length) + 1;
        if(search !== ''){
            query = {page:page,term:search.value};
        }else{
            query.page = page;
        }

        if($scope.orderBy && !sortingColumnName){
          query.orderby = $scope.orderBy;
        }
        //Do not sort when is a destroy column
        else if(!$scope.columns[sortingColumnIndex].destroy && !$scope.columns[sortingColumnIndex].editUrl){
          query.orderby = sortingColumnName + ' ' + sortingDirection;
          //$('.dataTables_wrapper .top .sorting-by-label').text('Ordenado por: '+ sortingColumnLabel);
        }

        //console.log(query.orderby);

        $scope.apiResource(page,query)
          .then(
            function(res){
              console.log(res);
              var result = res.data;
              var records = {
                  'draw': draw,
                  'recordsTotal': result.total,
                  'recordsFiltered': result.total,
                  'data': result.data
              };
              fnCallback(records);
            },
            function(err){
              console.log(err);
            }
          );
      }

      $scope.dtColumns = [];

      console.log($scope.columns);

      $scope.columns.forEach(function(column){
        $scope.dtColumns.push(
          DTColumnBuilder
            .newColumn(column.key).withTitle(column.label)
            .renderWith(
              function renderCell(data, type, full, pos){
                var html = '';
                var id = 'id';
                var icon = '<i class="icon-search"></i>';

                if(column.yesNo){
                  data = data ? 'Si' : 'No';
                }

                if(column.destroy){
                  id = (column.propId) ? column.propId : 'id';
                  html = '<a href="#" ng-click="showDestroyDialog($event, \''+ full[id] +'\')">Eliminar</a>';
                }
                else if(column.editUrl){
                  id = (column.propId) ? column.propId : 'id';
                  icon = '<i class="icon-search"></i>';

                  if($scope.quickEdit){
                    html = '<a href="#" ng-click="editFn($event'+ ', \'' + full[id]+'\' )">' + icon + '</a>';
                  }else{
                    html = '<a href="'+(column.editUrl + full[id])+'">' + icon + '</a>';
                  }
                }
                else if(column.actions){
                  id = (column.propId) ? column.propId : 'id';
                  icon = '<i class="icon-search"></i>';

                  column.actions.forEach(function(action){
                    if(action.type === 'edit'){
                      icon = '<i class="icon-search edit-icon"></i>';
                      html += '<a href="'+(action.url + full[id])+'">' + icon + '</a>';
                    }
                    else if(action.type === 'delete'){
                      icon = '<i class="icon-ofertas delete-icon"></i>';
                      html += '<a href="'+(action.url + full[id])+'">' + icon + '</a>';
                    }
                  });
                }
                else{
                  if(column.actionUrl){
                    id = (column.propId) ? column.propId : 'id';
                    if($scope.quickEdit){
                      html = '<a href="#" ng-click="editFn($event'+ ', \'' + full[id]+ '\')">' + data + '</a>';
                    }else{
                      html = '<a href="'+(column.actionUrl + full[id])+'">' + data + '</a>';
                    }
                  }else{
                    html = data;
                  }
                }

                return html;
              }
            )
        );
      });

      $rootScope.$on('reloadTable', function(event, data){
        console.log(data);
        console.log(event);
        var callback = function(json){console.log(json);};
        //var resetPaging = false;
        //$scope.dtInstance.reloadData(callback, resetPaging);
        //$scope.dtInstance.reloadData(callback, resetPaging);
        $scope.dtInstance.rerender();
        /*
        DTInstances.getLast().then(function(instance) {
            dtInstance = instance;
            dtInstance.reloadData();
        });
        */


      });

    };
    controller.$inject = ['$scope','$rootScope','DTOptionsBuilder','DTColumnBuilder','dialogService','$compile'];

    /** @ngInject */
    function tableList(){
      return {
        controller : controller,
        scope : {
          apiResource : '=',
          destroyFn: '=',
          editFn: '=',
          quickEdit: '=',
          columns: '=',
          actionUrl: '=',
          searchText: '@',
          orderBy: '@',
        },
        templateUrl : 'views/directives/table-list.html'
      };
    }
})();
