(function() {
  'use strict';

  function MainCtrl(
    api,
    $routeParams,
    $mdUtil,
    $rootScope,
    $q,
    $scope,
    $location,
    $window,
    $timeout,
    $mdSidenav,
    authService,
    categoriesService,
    quotationService,
    localStorageService,
    userService,
    siteService,
    dialogService,
    commonService,
    metaTagsService,
    ENV,
    SITE
  ) {
    var vm = this;
    angular.extend(vm, {
      activeStore: {},
      isActiveBackdrop: false,
      isActiveLogin: false,
      isLoadingLogin: false,
      isActiveSchedulesModal: false,
      loginForm: {},
      mapTerminalCode: commonService.mapTerminalCode,
      pointersSidenav: [],
      currentYear: moment().format('YYYY'),
      deactivateLoginModal: deactivateLoginModal,
      getActiveModule: getActiveModule,
      getCategoryBackground: getCategoryBackground,
      getCategoryIcon: getCategoryIcon,
      handleSearch: handleSearch,
      logOut: logOut,
      removeCurrentQuotation: removeCurrentQuotation,
      signIn: signIn,
      toggleLoginModal: toggleLoginModal,
      toggleSchedulesModal: toggleSchedulesModal,
      togglePointerSidenav: togglePointerSidenav,
      toggleProfileModal: toggleProfileModal,
      getFaviconUrl: getFaviconUrl,
      toggleMobileSidenav: toggleMobileSidenav,
      showPhoneNumberDialog: showPhoneNumberDialog,
      siteTheme: SITE.name,
      siteConstants: SITE,
      handleCategoryHover: handleCategoryHover,
      handleCategoryLeave: handleCategoryLeave,
      handleAccordion: handleAccordion,
      api: api
    });
    $rootScope.loadActiveQuotation = loadActiveQuotation;
    $rootScope.toggleLoginModal = toggleLoginModal;
    $rootScope.siteTheme = vm.siteTheme;
    $rootScope.siteConstants = vm.siteConstants;
    console.log('vm.siteConstants', vm.siteConstants);
    $scope.mainData;

    metaTagsService.setMetaTags();
    vm.metatags = $rootScope.metatags;

    $rootScope.$on('metatagsChanged', function(ev, metatags) {
      vm.metatags = metatags;
    });

    init();

    function getFaviconUrl() {
      var faviconUrl = '/images/favicon.ico';
      switch (vm.siteTheme) {
        case 'actual-home':
          faviconUrl = '/images/actual-home-favicon.png';
          break;
        case 'actual-studio':
          faviconUrl = '/images/actual-studio-favicon.png';
          break;
        case 'actual-kids':
          faviconUrl = '/images/actual-kids-favicon.png';
          break;
      }
      return faviconUrl;
    }

    function init() {
      vm.token = localStorageService.get('token');
      vm.user = localStorageService.get('user');
      vm.activeStoreId = localStorageService.get('activeStore');
      $rootScope.user = vm.user;
      vm.isUserSellerOrAdmin = authService.isUserSellerOrAdmin();
      vm.accordion = {
        current: null
      };
      vm.categories = [
        {
          name: 'Salas',
          sub: [
            {
              name: 'Salas Esquineras',
              url: ''
            },
            {
              name: 'Salas Modulares',
              url: ''
            },
            {
              name: 'Sofás Cama',
              url: ''
            },
            {
              name: 'Futones',
              url: ''
            },
            {
              name: 'Sillones',
              url: ''
            },
            {
              name: 'Sillones Reclinables',
              url: ''
            },
            {
              name: 'Salas de Cine',
              url: ''
            },
            {
              name: 'Taburetes',
              url: ''
            },
            {
              name: 'Salas para Jardín',
              url: ''
            },
            {
              name: 'Mesas de Centro',
              url: ''
            },
            {
              name: 'Credenzas',
              url: ''
            }
          ]
        },
        {
          name: 'Comedores',
          sub: [
            {
              name: 'Mesas de Comedor',
              url: ''
            },
            {
              name: 'Sillas de Comedor',
              url: ''
            },
            {
              name: 'Bancos para Barra',
              url: ''
            },
            {
              name: 'Bufeteros',
              url: ''
            }
          ]
        },
        {
          name: 'Sillas y Bancos',
          sub: [
            {
              name: 'Sillas de Comedor',
              url: ''
            },
            {
              name: 'Sillas para Oficina',
              url: ''
            },
            {
              name: 'Sillas para Jardín',
              url: ''
            },
            {
              name: 'Bancos para Barra',
              url: ''
            }
          ]
        },
        {
          name: 'Recámaras',
          sub: [
            {
              name: 'Camas',
              url: ''
            },
            {
              name: 'Cabeceras',
              url: ''
            },
            {
              name: 'Bases de Cama',
              url: ''
            },
            {
              name: 'Futones',
              url: ''
            },
            {
              name: 'Sofás Cama',
              url: ''
            },
            {
              name: 'Burós',
              url: ''
            },
            {
              name: 'Colchones',
              url: ''
            }
          ]
        },
        {
          name: 'Muebles de Exterior',
          sub: [
            {
              name: 'Salas para Jardín',
              url: ''
            },
            {
              name: 'Sillones para Exterior',
              url: ''
            },
            {
              name: 'Mesas para Jardín',
              url: ''
            },
            {
              name: 'Sillas para Jardín',
              url: ''
            },
            {
              name: 'Camastros',
              url: ''
            },
            {
              name: 'Sombrillas',
              url: ''
            }
          ]
        },
        {
          name: 'Muebles de Oficina',
          sub: [
            {
              name: 'Escritorios',
              url: ''
            },
            {
              name: 'Sillas para Oficina',
              url: ''
            },
            {
              name: 'Libreros',
              url: ''
            }
          ]
        },
        {
          name: 'Muebles de TV',
          sub: [
            {
              name: 'Muebles para TV',
              url: ''
            },
            {
              name: 'Centro de Entretenimiento',
              url: ''
            },
            {
              name: 'Sillones Riclinables',
              url: ''
            },
            {
              name: 'Salas de Cine',
              url: ''
            }
          ]
        }
      ];

      vm.subcategories = {
        Salas: [
          {
            name: 'Salas Esquineras',
            url: ''
          },
          {
            name: 'Salas Modulares',
            url: ''
          },
          {
            name: 'Sofás Cama',
            url: ''
          },
          {
            name: 'Futones',
            url: ''
          },
          {
            name: 'Sillones',
            url: ''
          },
          {
            name: 'Sillones Reclinables',
            url: ''
          },
          {
            name: 'Salas de Cine',
            url: ''
          },
          {
            name: 'Taburetes',
            url: ''
          },
          {
            name: 'Salas para Jardín',
            url: ''
          },
          {
            name: 'Mesas de Centro',
            url: ''
          },
          {
            name: 'Credenzas',
            url: ''
          }
        ],
        Comedores: [
          {
            name: 'Mesas de Comedor',
            url: ''
          },
          {
            name: 'Sillas de Comedor',
            url: ''
          },
          {
            name: 'Bancos para Barra',
            url: ''
          },
          {
            name: 'Bufeteros',
            url: ''
          }
        ],
        SillasBancos: [
          {
            name: 'Sillas de Comedor',
            url: ''
          },
          {
            name: 'Sillas para Oficina',
            url: ''
          },
          {
            name: 'Sillas para Jardín',
            url: ''
          },
          {
            name: 'Bancos para Barra',
            url: ''
          }
        ],
        Recamaras: [
          {
            name: 'Camas',
            url: ''
          },
          {
            name: 'Cabeceras',
            url: ''
          },
          {
            name: 'Bases de Cama',
            url: ''
          },
          {
            name: 'Futones',
            url: ''
          },
          {
            name: 'Sofás Cama',
            url: ''
          },
          {
            name: 'Burós',
            url: ''
          },
          {
            name: 'Colchones',
            url: ''
          }
        ],
        MueblesExterior: [
          {
            name: 'Salas para Jardín',
            url: ''
          },
          {
            name: 'Sillones para Exterior',
            url: ''
          },
          {
            name: 'Mesas para Jardín',
            url: ''
          },
          {
            name: 'Sillas para Jardín',
            url: ''
          },
          {
            name: 'Camastros',
            url: ''
          },
          {
            name: 'Sombrillas',
            url: ''
          }
        ],
        MueblesOficina: [
          {
            name: 'Escritorios',
            url: ''
          },
          {
            name: 'Sillas para Oficina',
            url: ''
          },
          {
            name: 'Libreros',
            url: ''
          }
        ],
        MueblesTV: [
          {
            name: 'Muebles para TV',
            url: ''
          },
          {
            name: 'Centro de Entretenimiento',
            url: ''
          },
          {
            name: 'Sillones Riclinables',
            url: ''
          },
          {
            name: 'Salas de Cine',
            url: ''
          }
        ]
      };
      vm.activeCategory = [false, false, false, false, false, false, false];
      if ($location.search().itemcode) {
        vm.searchingItemCode = true;
      }
      console.log('USER INVITED: ', $rootScope.user);

      loadMainData();
      loadSiteInfo();

      buildPointersSidenav();
      vm.isLoadingCategoriesTree = true;
      categoriesService
        .createCategoriesTree()
        .then(function(res) {
          vm.isLoadingCategoriesTree = false;
          vm.categoriesTree = res.data;
          $rootScope.categoriesTree = vm.categoriesTree;
          $rootScope.$emit('categoriesTreeLoaded', vm.categoriesTree);
        })
        .catch(function(err) {
          console.log(err);
        });

      $scope.$watch(
        function() {
          return localStorageService.get('quotation');
        },
        function(quotation) {
          vm.quotation = quotation;
        }
      );

      moment.locale('es');

      $(document).click(function(e) {
        var $target = $(event.target);
        var profileHeader = $('#profile-header');
        var profileHeaderTrigger = $('#profile-header-trigger');

        var loginHeader = $('#login-header');
        var loginHeaderTrigger = $('#login-header-trigger, .login-toggler');

        var schedulesModal = $('#schedules-modal');
        var schedulesModalTrigger = $('.schedules-modal-trigger');

        if (
          !$target.is(profileHeader) &&
          !$target.is(profileHeaderTrigger) &&
          !profileHeaderTrigger.find($target).length &&
          vm.isActiveProfileHeader
        ) {
          toggleProfileModal();
        } else if (
          !$target.is(loginHeader) &&
          !$target.is(loginHeaderTrigger) &&
          !loginHeaderTrigger.find($target).length &&
          vm.isActiveLogin
        ) {
          toggleLoginModal();
        } else if (
          !$target.is(schedulesModal) &&
          !$target.is(schedulesModalTrigger) &&
          !schedulesModalTrigger.find($target).length &&
          vm.isActiveSchedulesModal
        ) {
          toggleSchedulesModal();
        }

        $scope.$apply();
      });
    }

    function toggleLoginModal() {
      if (vm.isActiveLogin) {
        vm.isActiveLogin = false;
        vm.isActiveBackdrop = false;
      } else {
        vm.isActiveLogin = true;
        vm.isActiveBackdrop = true;

        vm.isActiveProfileHeader = false;
        vm.isActiveSchedulesModal = false;
      }
    }

    function toggleProfileModal() {
      if (vm.isActiveProfileHeader) {
        vm.isActiveProfileHeader = false;
        vm.isActiveBackdrop = false;
      } else {
        vm.isActiveProfileHeader = true;
        vm.isActiveBackdrop = true;

        vm.isActiveSchedulesModal = false;
        vm.isActiveLogin = false;
      }
    }

    function toggleSchedulesModal() {
      console.log('toggleSchedulesModal');

      if (vm.isActiveSchedulesModal) {
        vm.isActiveSchedulesModal = false;
        vm.isActiveBackdrop = false;
      } else {
        vm.isActiveSchedulesModal = true;
        vm.isActiveBackdrop = true;

        vm.isActiveLogin = false;
        vm.isActiveProfileHeader = false;
      }
    }

    function toggleMobileSidenav() {
      $mdSidenav('mobileSidenav').toggle();
    }

    function handleSearch() {
      var params = {
        term: vm.searchValue
      };
      vm.showSearchBar = false;

      $location.path('/search').search(params);
    }

    function resetSearchBox() {
      vm.searchValue = '';
    }

    function buildPointersSidenav() {
      for (var i = 0; i < 9; i++) {
        vm.pointersSidenav.push({ selected: false });
      }
    }

    function loadMainData() {
      console.log('cargando main data', new Date());
      $rootScope.isMainDataLoaded = false;
      $q
        .all([loadActiveStore(), loadActiveQuotation()])
        .then(function(data) {
          $scope.mainData = {
            activeStore: data[0],
            activeQuotation: data[1]
          };
          console.log('$scope.mainData', $scope.mainData);
          $rootScope.$emit('mainDataLoaded', $scope.mainData);
          $rootScope.isMainDataLoaded = true;
          console.log('termino main data', new Date());
        })
        .catch(function(err) {
          console.log('err', err);
        });
    }

    function loadActiveStore() {
      console.log('loadActiveStore start', new Date());
      var deferred = $q.defer();
      userService
        .getActiveStore()
        .then(function(activeStore) {
          console.log('activestore', activeStore);
          vm.activeStore = activeStore;
          $rootScope.activeStore = activeStore;
          console.log('loadActiveStore end', new Date());
          $rootScope.$emit('activeStoreAssigned', activeStore);
          deferred.resolve(activeStore);
        })
        .catch(function(err) {
          console.log(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function loadActiveQuotation() {
      var deferred = $q.defer();
      console.log('start loadActiveQuotation', new Date());

      quotationService
        .getActiveQuotation()
        .then(function(res) {
          var quotation = res.data;
          console.log('quotation', quotation);
          $rootScope.isActiveQuotationLoaded = true;
          if (quotation && quotation.id) {
            vm.activeQuotation = quotation;
            $rootScope.activeQuotation = quotation;
            $rootScope.$emit('activeQuotationAssigned', vm.activeQuotation);
            deferred.resolve(vm.activeQuotation);
            console.log('finish loadActiveQuotation', new Date());
          } else {
            vm.activeQuotation = false;
            $rootScope.activeQuotation = false;
            $rootScope.$emit('activeQuotationAssigned', false);
            deferred.resolve(false);
          }
        })
        .catch(function(err) {
          $rootScope.activeQuotation = false;
          localStorageService.remove('quotation');
        });
      return deferred.promise;
    }

    function loadSiteInfo() {
      var deferred = $q.defer();
      console.log('loadSiteInfo start', new Date());
      siteService
        .findByHandle(vm.siteTheme)
        .then(function(res) {
          vm.site = res.data || {};
          $rootScope.site = res.data || {};
          deferred.resolve(vm.site);
          console.log('loadSiteInfo end', new Date());
        })
        .catch(function(err) {
          console.log(err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    $rootScope.$on('newActiveQuotation', function(ev, newQuotationId) {
      loadActiveQuotation();
    });

    function removeCurrentQuotation() {
      quotationService.removeCurrentQuotation();
    }

    function togglePointerSidenav() {
      $mdSidenav('right').toggle();
    }

    function getCategoryIcon(handle) {
      return categoriesService.getCategoryIcon(handle);
    }

    //$rootScope.$on("$locationChangeStart",function(event, next, current){
    $scope.$on('$routeChangeStart', function(event, next, current) {
      if (current) {
        authService.runPolicies();

        //Only updating active quotation on every page change
        $rootScope.isActiveQuotationLoaded = false;
        loadActiveQuotation().then(function() {
          $scope.mainData = $scope.mainData || {};
          $scope.mainData.activeQuotation = $rootScope.activeQuotation;
          $rootScope.$emit('mainDataLoaded', $scope.mainData);
          $rootScope.isMainDataLoaded = true;

          console.log('loaded activeQuotation', $rootScope.activeQuotation);
        });

        resetSearchBox();
      }

      vm.activeModule = vm.getActiveModule();
      if ($location.search().itemcode) {
        vm.searchingItemCode = true;
      } else {
        vm.searchingItemCode = false;
      }
    });

    function getActiveModule() {
      var activeModule = false;
      var path = $location.path();
      var policiesPaths = [
        '/politicas-de-entrega',
        '/politicas-de-garantia',
        '/politicas-de-almacenaje',
        '/politicas-de-instalacion-y-ensamble'
      ];
      var manualsPaths = [
        '/manual-de-cuidados-y-recomendaciones/pieles',
        '/manual-de-cuidados-y-recomendaciones/aceros',
        '/manual-de-cuidados-y-recomendaciones/aluminios',
        '/manual-de-cuidados-y-recomendaciones/cristales',
        '/manual-de-cuidados-y-recomendaciones/cromados',
        '/manual-de-cuidados-y-recomendaciones',
        '/manual-de-cuidados-y-recomendaciones/maderas',
        '/manual-de-cuidados-y-recomendaciones/piezas-plasticas',
        '/manual-de-cuidados-y-recomendaciones/textiles',
        '/manual-de-cuidados-y-recomendaciones/viniles',
        '/manual-de-cuidados-y-recomendaciones/vinilos',
        '/manual-de-cuidados-y-recomendaciones/pintura-electrostatica'
      ];

      if (path.indexOf('addquotation') >= 0) {
        activeModule = 'addquotation';
      } else if (path.indexOf('quotations') >= 0) {
        activeModule = 'quotations';
      } else if (path.indexOf('orders') >= 0) {
        activeModule = 'orders';
      } else if (policiesPaths.indexOf(path) > -1) {
        activeModule = 'policies';
      } else if (manualsPaths.indexOf(path) > -1) {
        activeModule = 'manuals';
      }
      return activeModule;
    }

    function hideProfileModal() {
      vm.isActiveProfileHeader = false;
      vm.isActiveBackdrop = false;
    }

    function activateLoginModal() {
      if (!vm.user) {
        vm.isActiveLogin = true;
        vm.isActiveBackdrop = true;
      }
    }

    function deactivateLoginModal() {
      if (!vm.user) {
        vm.isActiveLogin = false;
        vm.isActiveBackdrop = false;
      }
    }

    function handleSignInError(err) {
      vm.isLoadingLogin = false;
      if (err) {
        console.log('err handleSignInError', err);
        vm.loginErr = 'Datos incorrectos';
        console.log('vm.loginErr', vm.loginErr);
      }
    }

    function signIn() {
      vm.isLoadingLogin = true;
      var formData = {
        email: vm.loginForm.email,
        password: vm.loginForm.password
      };
      authService.signIn(formData, $rootScope.successAuth, handleSignInError);
    }

    function logOut() {
      authService.logout(function() {
        $location.path('/');
        $window.location.reload();
      });
    }

    function setUserTokensOnResponse(res) {
      console.log('res setUserTokensOnResponse', res);
      vm.token = res.data.token;
      vm.user = res.data.user;

      localStorageService.remove('currentQuotation');
      localStorageService.set('token', vm.token);
      localStorageService.set('user', vm.user);
      localStorageService.set('activeStore', vm.user.activeStore);
    }

    $rootScope.successAuth = function(res) {
      setUserTokensOnResponse(res);

      assignCurrentUserToQuotationIfNeeded()
        .then(function(quotationUpdated) {
          console.log('quotationUpdated', quotationUpdated);

          if (quotationUpdated) {
            console.log('redirecting');

            if ($routeParams.redirectTo) {
              $location.path($routeParams.redirectTo);
              return;
            } else {
              $location.path(
                '/checkout/client/' + $rootScope.activeQuotation.id
              );
              return;
            }
          }

          var quotationPath = '/quotations/edit';
          if ($location.path().indexOf(quotationPath) > -1) {
            $window.location = '/';
          } else if ($routeParams.redirectTo) {
            $window.location = $routeParams.redirectTo;
          } else if ($routeParams.completeRegister) {
            $window.location = '/?completeRegister';
          } else {
            $window.location.reload();
          }
          return;
        })
        .catch(function(err) {
          console.log('err successAuth', err);
        });
    };

    $rootScope.successAuthInCheckout = function(res) {
      console.log('successAuthInCheckout');
      setUserTokensOnResponse(res);
    };

    function assignCurrentUserToQuotationIfNeeded() {
      var activeQuotationHasClient = ($rootScope.activeQuotation || {}).Client
        ? true
        : false;

      console.log('$rootScope.activeQuotation', $rootScope.activeQuotation);
      console.log('activeQuotationHasClient', activeQuotationHasClient);

      if (
        vm.user &&
        !authService.isUserAdmin(vm.user) &&
        $rootScope.activeQuotation &&
        !activeQuotationHasClient
      ) {
        var quotationId = $rootScope.activeQuotation.id;
        var params = {
          Client: vm.user.Client,
          UserWeb: vm.user.id
        };
        return quotationService.update(quotationId, params);
      } else {
        var deferred = $q.defer();
        deferred.resolve();
        return deferred.promise;
      }
    }

    function getCategoryBackground(handle) {
      var image = '/images/mesas.jpg';
      image = api.baseUrl + '/categories/' + handle + '.jpg';
      return { 'background-image': 'url(' + image + ')' };
    }

    function showPhoneNumberDialog() {
      dialogService.showDialog('Asistencia en su compra: 01 (998) 884 1594');
    }

    function handleCategoryHover(id) {
      console.log('ARRAY CAT: ', vm.activeCategory);
      vm.activeCategory.map(function(active) {
        return (active = false);
      });
      vm.activeCategory[id] = true;
    }

    function handleCategoryLeave() {
      console.log('HOLAAAAAAAA');
      vm.activeCategory = vm.activeCategory.map(function(active) {
        return (active = false);
      });
      console.log(vm.activeCategory);
    }

    function handleAccordion(name) {
      console.log('ACORDION BEFORE: ', vm.accordion.current);
      vm.accordion.current = vm.accordion.current === name ? null : name;
      console.log('ACORDION: ', vm.accordion.current);
    }

    $scope.$on('$routeChangeStart', function(next, current) {
      vm.isActiveBackdrop = false;
      vm.isActiveLogin = false;
      vm.isLoadingLogin = false;

      if ($mdSidenav('mobileSidenav').isOpen()) {
        $mdSidenav('mobileSidenav').close();
      }
    });

    $rootScope.scrollTo = function(target, offset) {
      $timeout(function() {
        offset = offset || 100;

        $('html, body').animate(
          {
            scrollTop: $('#' + target).offset().top - offset
          },
          600
        );
      }, 300);
    };
  }

  angular.module('actualWebApp').controller('MainCtrl', MainCtrl);
  MainCtrl.$inject = [
    'api',
    '$routeParams',
    '$mdUtil',
    '$rootScope',
    '$q',
    '$scope',
    '$location',
    '$window',
    '$timeout',
    '$mdSidenav',
    'authService',
    'categoriesService',
    'quotationService',
    'localStorageService',
    'userService',
    'siteService',
    'dialogService',
    'commonService',
    'metaTagsService',
    'ENV',
    'SITE'
  ];
})();
