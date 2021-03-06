(function() {
  'use strict';

  angular.module('actualWebApp').directive('tableList', tableList);

  var controller = function(
    $scope,
    $rootScope,
    $timeout,
    DTOptionsBuilder,
    DTColumnBuilder,
    dialogService,
    $compile,
    $filter,
    formatService,
    ENV
  ) {
    $scope.enableSearchField = angular.isDefined($scope.enableSearchField)
      ? $scope.enableSearchField
      : true;

    $scope.dtInstance = {};
    $scope.isExporting = false;
    $scope.currentOrderColumnIndex = 0;
    $scope.wrapperElementId = '';

    $scope.showDestroyDialog = function(ev, id) {
      dialogService.showDestroyDialog(ev, $scope.destroyFn, id);
    };

    $scope.domLayout =
      '<"top"f>rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>';

    if ($scope.paginationPosition === 'top') {
      $scope.domLayout = '<"pagination"p><"top"f>rt';
    }

    $scope.dtOptions = DTOptionsBuilder.newOptions()
      .withFnServerData(serverData)
      .withDataProp('data')
      .withOption('processing', true)
      .withOption('serverSide', true)
      .withOption('paging', true)
      .withOption('responsive', true)
      .withOption('autoWidth', true)
      .withOption('displayLength', 10)
      .withOption('bLengthChange', false)
      .withOption('oLanguage', { sEmptyTable: 'No hay información' })
      //.withPaginationType('numbers')
      .withPaginationType('input')
      .withDOM($scope.domLayout)
      .withOption('createdRow', function(row, data, index) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
        if ($scope.createdRowCb) {
          $scope.createdRowCb(row, data, index);
        }
      })
      .withOption('order', getDefaultSortOption())
      .withOption('initComplete', function(options) {
        $scope.wrapperElementId = '#' + options.nTableWrapper.id;

        if ($('#new-search').length <= 0) {
          /*
            $('<p class="sorting-by-label"></p>').appendTo($scope.wrapperElementId + ' .top');
            createOrderByLabel();
            */

          if ($scope.clientSearch && !$scope.clientSearchTerm) {
            $(
              '<label class="populate-search-checkbox" for="' +
                $scope.wrapperElementId +
                '-checkbox"><input type="checkbox" id="' +
                $scope.wrapperElementId +
                '-checkbox" />Buscar por cliente | </label>'
            ).appendTo($scope.wrapperElementId + ' .dataTables_filter');
          }

          $('<button/>')
            .text('Buscar')
            .attr('id', 'new-search')
            .appendTo($scope.wrapperElementId + ' .dataTables_filter');

          if (!$scope.enableSearchField) {
            $($scope.wrapperElementId + ' .dataTables_filter').hide();
          }

          if ($scope.exportQuery && !$scope.exportEventEmitterName) {
            $(
              '<a class="export-button" href="" ng-click="exportToExcel()">Exportar registros</a>'
            ).appendTo($scope.wrapperElementId + ' .top ');
            $compile($('.export-button'))($scope);
          }

          $scope.$on($scope.exportEventEmitterName, function(evt, args) {
            $scope.exportToExcel();
          });

          $scope.$on($scope.searchEventEmitterName, function(evt, args) {
            $scope.dtInstance.DataTable.search('').draw();
          });
        }

        //$('.dataTables_filter label:first').text('Buscar');

        $('.dataTables_filter input').unbind();
        $('.dataTables_filter input').keypress(function(e) {
          if (e.which == 10 || e.which == 13) {
            $scope.dtInstance.DataTable.search(
              $($scope.wrapperElementId + ' .dataTables_filter input').val()
            ).draw();
          }
        });
        $('#new-search').on('click', function() {
          $scope.dtInstance.DataTable.search(
            $($scope.wrapperElementId + ' .dataTables_filter input').val()
          ).draw();
        });

        changePaginationLabels();
      });
    /*
        .withButtons([
          {
            extend: 'excel',
            text: 'Exportar pagina',
            filename: 'MyDT',
            name: 'Productos',
            extension: '.xlsx'
          },
        ])
        */

    function changePaginationLabels() {
      $('.dataTables_wrapper .first.paginate_button').text('Inicio');
      $('.dataTables_wrapper .previous.paginate_button').text('Anterior');
      $('.dataTables_wrapper .paginate_page').text('Página');
      $('.dataTables_wrapper .next.paginate_button').text('Siguiente');
      $('.dataTables_wrapper .last.paginate_button').text('Último');
    }

    function getDefaultSortOption() {
      var defaultSort = [0, 'asc'];
      $scope.currentOrderColumnIndex = 0;
      if ($scope.defaultSort) {
        defaultSort = $scope.defaultSort;
        $scope.currentOrderColumnIndex = $scope.defaultSort[0];
      }
      return defaultSort;
    }

    function createOrderByLabel() {
      var columnName = $scope.columns[$scope.currentOrderColumnIndex].label;
      var orderColumn;
      if ($scope.sortColumName) {
        orderColumn = $scope.columns[$scope.currentOrderColumnIndex];
        columnName = orderColumn.label;
      }
      $($scope.wrapperElementId + ' .top .sorting-by-label').text(
        'Ordenado por: ' + columnName
      );
    }

    function getSortingColumnIndex(sorting) {
      var index;
      if (angular.isArray(sorting)) {
        index = sorting[0];
      } else {
        index = sorting;
      }
      return index;
    }

    function getSortingDirection(sortingSettings) {
      var direction;
      if (angular.isArray(sortingSettings[0])) {
        direction = sortingSettings[0][1];
      } else {
        direction = sortingSettings[1];
      }
      return direction;
    }

    function serverData(sSource, aoData, fnCallback, oSettings) {
      //All the parameters you need is in the aoData variable
      var draw = aoData[0].value;
      var columns = aoData[1].value;
      var start = aoData[3].value;
      var length = aoData[4].value;
      var search = aoData[5].value;
      var page = 0;
      var query = {};
      var sorting = oSettings.aaSorting[0];
      var sortingDirection = getSortingDirection(oSettings.aaSorting);
      var sortingColumnIndex = getSortingColumnIndex(sorting);
      var sortingColumnName = columns[sortingColumnIndex].data;

      page = start === 0 ? 1 : start / length + 1;
      if (search !== '') {
        query = { page: page, term: search.value };
      } else {
        query.page = page;
      }

      //Do not sort when is a destroy column
      if (!isActionColum(sortingColumnIndex)) {
        $scope.currentOrderColumnIndex = sortingColumnIndex;
        query.orderby = sortingColumnName + ' ' + sortingDirection;
        createOrderByLabel();
      }

      query.fields = [];
      query.filters = $scope.filters || false;

      var clientSearchCheckbox = document.getElementById(
        $scope.wrapperElementId + '-checkbox'
      );
      if (clientSearchCheckbox && clientSearchCheckbox.checked) {
        query.clientSearch = true;
      } else {
        query.clientSearch = false;
      }

      //Cleaning filters
      var aux = {};
      for (var key in query.filters) {
        if (query.filters[key] === true || query.filters[key] === false) {
          aux[key] = query.filters[key];
        } else if (query.filters[key] !== 'none') {
          if (!isNaN(query.filters[key]) && key !== 'folio') {
            aux[key] = parseFloat(query.filters[key]);
          } else {
            aux[key] = query.filters[key];
          }
        }
      }
      query.filters = aux;

      $scope.columns.forEach(function(col) {
        if (!col.destroy && !col.editUrl && !col.quickEdit) {
          query.fields.push(col.key);
        }
      });

      if ($scope.dateRange) {
        query.dateRange = $scope.dateRange;
      }

      if ($scope.clientSearchTerm) {
        query.clientSearchTerm = $scope.clientSearchTerm;
      }

      $scope.query = query;
      $scope.page = page;

      $scope.apiResource(page, query).then(
        function(result) {
          var res = result.data;
          var records = {
            draw: draw,
            recordsTotal: res.total,
            recordsFiltered: res.total,
            data: res.data
          };
          $scope.sortedCount++;
          fnCallback(records);
        },
        function(err) {
          console.log(err);
        }
      );
    }

    function isActionColum(columnIndex) {
      return (
        $scope.columns[columnIndex].destroy ||
        $scope.columns[columnIndex].editUrl
      );
    }

    $scope.dtColumns = [];

    $scope.columns.forEach(function(column) {
      $scope.dtColumns.push(
        DTColumnBuilder.newColumn(column.key)
          .withTitle(column.label)
          .renderWith(function renderCell(data, type, full, pos) {
            var html = '';
            var id = 'id';
            var icon = '<i class="icon-search"></i>';
            var siteDomain = getSiteDomainByMapper(
              column.domainMapper,
              column.domainColumn,
              full
            );
            //console.log('column', column);

            if (column.yesNo) {
              data = formatService.yesNoFormat(data);
            }
            if (column.defaultValue) {
              data = data ? data : column.defaultValue;
            }
            if (!data && data !== 0) {
              data = formatService.nullFormat(data);
            }
            if (column.mapper) {
              var data_b = data;
              data = column.mapper[data] || data;
            }
            if (column.dateTime) {
              data = data = formatService.dateTimeFormat(data);
            }
            if (column.date) {
              data = data = formatService.dateFormat(data);
            }
            if (column.currency) {
              data = data = formatService.currencyFormat(data);
            }
            if (column.isRateNormalized) {
              data = data * 100;
            }
            if (column.rate) {
              data = formatService.rateFormat(data);
            }
            if (column.destroy) {
              id = column.propId ? column.propId : 'id';
              html =
                '<a href="#" ng-click="showDestroyDialog($event, \'' +
                full[id] +
                '\')">Eliminar</a>';
            } else if (column.editUrl) {
              id = column.propId ? column.propId : 'id';
              icon = '<i class="icon-search"></i>';

              if ($scope.quickEdit) {
                html =
                  '<a href="#" ng-click="editFn($event' +
                  ", '" +
                  full[id] +
                  '\' )">' +
                  icon +
                  '</a>';
              } else {
                html =
                  '<a href="' +
                  (column.editUrl + full[id]) +
                  '">' +
                  icon +
                  '</a>';
              }
            } else if (column.seeUrl) {
              var id = column.propId ? column.propId : 'id';
              if (full[id]) {
                var icon =
                  '<md-icon md-font-icon="icon-link" class="icon icon-link md-font icon-link material-icons md-default-theme" aria-hidden="true"></md-icon>';
                html =
                  '<a target="_blank" href="' +
                  (column.seeUrl + full[id]) +
                  '">' +
                  icon +
                  '</a>';
              } else {
                var icon =
                  '<md-icon md-font-icon="icon-link" class="icon icon-link gray md-font material-icons md-default-theme" aria-hidden="true"></md-icon>';
                html = '<a>' + icon + '</a>';
              }
            } else if (column.actions) {
              id = column.propId ? column.propId : 'id';
              icon = '<i class="icon-search"></i>';

              column.actions.forEach(function(action) {
                if (action.type === 'edit') {
                  icon = '<i class="icon-search edit-icon"></i>';
                  html +=
                    '<a href="' +
                    (siteDomain + action.url + full[id]) +
                    '">' +
                    icon +
                    '</a>';
                } else if (action.type === 'delete') {
                  icon = '<i class="icon-ofertas delete-icon"></i>';
                  html +=
                    '<a href="' +
                    (siteDomain + action.url + full[id]) +
                    '">' +
                    icon +
                    '</a>';
                }
              });
            } else if (column.color) {
              data_b = column.color[data_b] || data_b;
              html = '<span style="color:' + data_b + ';">' + data + '</span>';
            } else {
              if (column.actionUrl) {
                id = column.propId ? column.propId : 'id';
                if ($scope.quickEdit) {
                  html =
                    '<a href="#" ng-click="editFn($event' +
                    ", '" +
                    full[id] +
                    '\')">' +
                    data +
                    '</a>';
                } else {
                  html =
                    '<a href="' +
                    (siteDomain + column.actionUrl + full[id]) +
                    '" class="action-url">' +
                    data +
                    '</a>';
                }
              } else {
                html = data;
              }
            }

            return html;
          })
      );
    });

    function getSiteDomainByMapper(domainMapper, domainColumn, row) {
      if (domainColumn && domainMapper && row) {
        var protocol = 'https://';

        var siteId = row[domainColumn];
        var siteDomain = domainMapper[siteId];
        var currentSiteDomain = $rootScope.siteConstants.domain;

        if (siteDomain === currentSiteDomain) {
          return '';
        }

        if (ENV.name === 'sandbox') {
          siteDomain = 'sandbox.' + siteDomain;
        }

        return protocol + siteDomain;
      }
      return '';
    }

    $rootScope.$on('reloadTable', function(event, data) {
      $timeout(function() {
        var callback = function(json) {
          console.log(json);
        };
        var resetPaging = false;
        if ($scope.dtInstance) {
          var searchValue = $(
            $scope.wrapperElementId + ' .dataTables_filter input'
          ).val();
          $scope.dtInstance.DataTable.search(searchValue).draw();
        }
      }, 100);
    });

    //$rootScope.$on('exportData', function(event, data){
    $scope.exportToExcel = function() {};
    /*
    $scope.exportToExcel = function() {
      if (!$scope.isExporting) {
        $scope.isExporting = true;
        console.log('isExporting', $scope.isExporting);
        $scope.$emit('isExporting', $scope.isExporting);

        $('.export-button').text('Exportando...');
        var auxQuery = angular.copy($scope.query);
        auxQuery.getAll = true;
        $scope.apiResource($scope.page, auxQuery).then(function(result) {
          var items = result.data.data;
          alasql($scope.exportQuery, [items]);
          $('.export-button').text('Exportar registros');
          $scope.isExporting = false;
          $scope.$emit('isExporting', $scope.isExporting);
        });
      }
    };
    */
  };
  controller.$inject = [
    '$scope',
    '$rootScope',
    '$timeout',
    'DTOptionsBuilder',
    'DTColumnBuilder',
    'dialogService',
    '$compile',
    '$filter',
    'formatService',
    'ENV'
  ];

  /** @ngInject */
  function tableList() {
    return {
      controller: controller,
      scope: {
        apiResource: '=',
        destroyFn: '=',
        editFn: '=',
        quickEdit: '=',
        columns: '=',
        actionUrl: '=',
        searchText: '@',
        defaultSort: '=',
        filters: '=',
        dateRange: '=',
        exportQuery: '=',
        exportColumns: '=',
        createdRowCb: '=',
        clientSearch: '=',
        clientSearchTerm: '=',
        exportEventEmitterName: '=',
        searchEventEmitterName: '=',
        enableSearchField: '=',
        paginationPosition: '='
      },
      templateUrl: 'views/directives/table-list.html'
    };
  }
})();
