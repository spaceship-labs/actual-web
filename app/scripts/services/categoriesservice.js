(function (){
  'use strict';

  angular
    .module('dashexampleApp')
    .factory('categoriesService', categoriesService);

  function categoriesService(api, $q){
    var service = {
      getCategories: getCategories,
      getCategoriesGroups: getCategoriesGroups,
      createCategoriesTree: createCategoriesTree
    };

    function getCategoriesGroups(){
      var url = '/productcategory/getcategoriesgroups';
      return api.$http.post(url);
    }

    function createCategoriesTree(){
      var url = '/productcategory/getcategoriestree';
      return api.$http.post(url);
    }

    function getCategories(){
      return categories;
    }

    var categories = [
      {
        isActive:false,
        handle: 'ambientes',
        label: 'Ambientes',
        icon:'ambientes',
        subcategories:[
          {isActive: false, label:'Set de salas',handle:'salas-completas'},
          {isActive: false, label:'Set de recamaras',handle:'recamaras-completas'},
          {isActive: false, label:'Set de comedores', handle:'mesas-y-sillas'}
        ]
      },
      {
        isActive:false,
        handle: 'colchones',
        label: 'Colchones',
        icon:'colchones',
        subcategories:[
          {isActive: false, label:'Colchon individual', handle:'colchon-individual'},
          {isActive: false, label:'Colchon matrimonial', handle:'colchon-matrimonial'},
          {isActive: false, label:'Colchon queen size', handle: 'colchon-queen-size'},
          {isActive: false, label:'Colchon king size', handle:'colchon-king-size'},
          {isActive: false, label:'Colchon para cuna', handle:'colchon-para-cuna'}
        ]
      },
      {
        isActive:false,
        handle: 'mesas',
        label: 'Mesas',
        icon:'mesas',
        subcategories:[
          {isActive: false, label:'Mesas de comedor', handle:'mesas-de-comedor'},
          {isActive: false, label:'Mesas de centro', handle:'mesas-de-centro'},
          {isActive: false, label:'Mesas laterales', handle:'mesas-laterales'},
          {isActive: false, label:'Mesas y sillas infantiles', handle:'mesas-y-sillas-infantiles'},
          {isActive: false, label:'Mesas de jardin', handle:'mesas-de-jardin'},
        ]
      },
      {
        isActive:false,
        handle: 'sillas',
        label: 'Sillas',
        icon:'sillas',
        subcategories:[
          {isActive: false, label:'Sillas para comedor', handle:'sillas-para-comedor'},
          {isActive: false, label:'Sillas para jardin', handle: 'sillas-para-jardin'},
          {isActive: false, label:'Sillas para oficina',handle:'sillas-para-oficina'},
          {isActive: false, label:'Bancos para barra', handle:'bancos-para-barra'}
        ]
      },
      {
        isActive: false,
        handle: 'ninos-y-bebes',
        label:'Bebes',
        icon:'bebes',
        subcategories:[
          {
            isActive:false,
            label:'Muebles para bebe',
            handle:'muebles-para-bebe',
            groups:[
              {label:'Cunas para bebes', handle:'cunas-para-bebes'},
              {label:'Colchon para cuna', handle:'colchon-para-cuna'}
            ]
          },
          {
            isActive:false,
            label:'Accesorios para bebe',
            handle:'accesorios-para-bebe',
            groups:[
              {label:'Móviles para bebes', handle:'moviles-para-bebes'},
              {label:'Edredones para cuna', handle:'edredones-para-cunas-para-cunas'},
              {label:'Cobijas para bebe', handle:'cobijas-para-bebe'},
              {label:'Bañeras para bebe', handle:'bañeras-para-bebe'},
              {label:'Cambiador de pañales', handle:'cambiador-de-pañales'}
            ]
          },
          {
            isActive:false,
            label:'Peluches',
            handle:'peluches',
          }
        ]
      },
      {
        isActive: false,
        handle: 'ninos',
        label:'Niños',
        icon:'ninos',
        subcategories:[
          {
            isActive: false,
            label:'Muebles infantiles',
            handle:'muebles-infantiles',
            groups:[
              {label:'Recamaras infantiles', handle:'recamaras-infantiles'},
              {label:'Camas infantiles', handle:'camas-infantiles'},
              {label:'Mesas y sillas infantiles', handle:'mesas-y-sillas-infantiles'},
              {label:'Bases para cama infantil', handle:'bases-para-cama-infantil'}
            ]
          },
          {
            isActive:false,
            label:'Decoración infantil',
            handle:'decoracion-infantil'
          },
          {
            isActive: false,
            label:'Peluches',
            handle:'peluches'
          }
        ]
      },
      {
        isActive:false,
        handle: 'blancos',
        label: 'Blancos',
        icon:'blancos',
        subcategories:[
          {
            isActive: false,
            label:'Edredones',
            handle:'edredones',
            groups:[
              {label:'Edredones para cunas', handle:'edredones-para-cunas'}
            ]
          },
          {isActive: false, label:'Sabanas', handle: 'sabanas'},
          {isActive: false, label:'Colchas', handle: 'colchas'},
          {
            isActive: false,
            label:'Cobijas',
            handle: 'cobijas',
            groups: [
              {label:'Cobijas para bebe', handle: 'cobijas-para-bebe'}
            ]
          },
          {isActive: false, label:'Cubrecamas', handle: 'cubrecamas'},
          {isActive: false, label:'Frazadas', handle: 'frazadas'},
          {isActive: false, label:'Cobertores', handle: 'cobertores'},
          {isActive: false, label:'Duvet', handle: 'duvet'},
          {isActive: false, label:'Rodapie cama', handle: 'rodapie-cama'},
          {isActive: false, label:'Almohadas', handle: 'almohadas'},
          {isActive: false, label:'Protector de colchon', handle: 'protector-de-colchon'},
          {isActive: false, label:'Toallas', handle: 'toallas'},
        ]
      },
      {
        isActive:false,
        handle: 'decoracion',
        label: 'Decoración',
        icon:'decoracion',
        subcategories:[
          {
            isActive: false,
            label:'Lamparas',
            handle:'lampara',
            groups:[
              {label:'Lamparas led', handle:'lamparas-led'},
              {label:'Lamparas de techo', handle:'lamparas-de-techo'},
              {label:'Lamparas de mesa', handle:'lamparas-de-mesa'},
              {label:'Lamparas de pie', handle:'lamparas-de-pie'},
              {label:'Lamparas infantiles', handle:'lamparas-infantiles'}
            ]
          },
          {
            isActive: false,
            label:'Tapetes',
            handle:'tapetes',
          },
          {
            isActive: false,
            label:'Cuadros',
            handle:'cuadros-decorativos',
          },
          {
            isActive: false,
            label:'Espejos',
            handle:'espejo',
          },
          {
            isActive: false,
            label:'Accesorios',
            handle:'accesorios',
            groups:[
              {label:'Floreros', handle:'floreros'},
              {label:'Canastas', handle:'canastas'},
              {label:'Portarretratos', handle:'portaretratos'},
              {label:'Flores artificiales', handle:'flores-artificiales'},
              {label:'Centros de mesa', handle:'centros-de-mesa'},
              {label:'Esculturas', handle:'esculturas'},
              {label:'Candelabro', handle:'candelabro'},
              {label:'Reloj de pared', handle:'reloj-de-pared'}
            ]
          },
          {
            isActive: false,
            label:'Accesorios para bebe',
            handle:'accesorios-para-bebe',
            groups:[
              {label:'Móviles para bebes', handle:'moviles-para-bebes'},
              {label:'Peluches', handle:'peluches'},
              {label:'Edredones para cunas', handle:'edredones-para-cunas'},
              {label:'Cobijas para bebe', handle:'cobijas-para-bebe'},
              {label:'Bañeras para bebes', handle:'baneras-para-bebes'},
              {label:'Cambiador de pañales', handle:'cambiador-de-pañales'},
            ]
          },
          {
            isActive: false,
            label:'Decoración infantil',
            handle:'decoracion-infantil',
          },
          {
            isActive: false,
            label:'Peluches',
            handle:'peluches',
          },
        ]
      },
      {
        isActive: false,
        label: 'Muebles',
        icon:'murbles',
        handle: 'muebles',
        subcategories:[
          {
            isActive: false,
            label: 'Salas',
            handle:'salas',
            groups: [
              {label:'Set de salas', handle:'salas-completas'},
              {label:'Salas esquineras', handle:'salas-esquineras'},
              {label:'Sofa',handle:'sofa'},
              {label:'Couch',handle:'couch'},
              {label:'Love Seat',handle:'love-seat'},
              {label:'Sillones',handle:'sillones'},
              {label:'Mesas de centro', handle:'mesas-de-centro'},
              {label:'Mesas laterales', handle:'mesas-laterales'}
            ]
          },
          {
            isActive: false,
            label: 'Recamaras',
            handle:'recamaras',
            groups: [
              {label:'Set de recamaras', handle:'recamaras-completas'},
              {label:'Camas', handle:'camas'},
              {label:'Sofa cama',handle:'sofa-cama'},
              {label:'Sillones',handle:'sillones'},
              {label:'Futon',handle:'futon'},
              {label:'Comoda',handle:'comoda'},
              {label:'Cajoneras', handle:'cajoneras'},
              {label:'Bases para cama', handle:'bases-para-cama'},
              {label:'Cajoneras', handle:'cajoneras'},
              {label:'Buros', handle:'buros'},
              {label:'Recamaras infantiles', handle:'recamaras-infantiles'},
              {label:'Camas infantiles', handle:'camas-infantiles'},
              {label:'Bases para cama infantil', handle:'bases-para-cama-infantil'},
              {label:'Cunas para bebes', handle:'cunas-para-bebes'},
            ]
          },
          {
            isActive: false,
            label: 'Comedores',
            handle:'comedores',
            groups: [
              {label:'Set de comedores', handle:'mesas-y-sillas'},
              {label:'Mesas de comedor', handle:'mesas-de-comedor'},
              {label:'Sillas para comedor', handle:'sillas-para-comedor'},
              {label:'Bufeteras', handle:'bufeteras'},
              {label:'Antecomedores', handle:'antecomedores'},
              {label:'Bancos para barra', handle:'bancos-para-barra'},
            ]
          },
          {
            isActive: false,
            label: 'Muebles para TV',
            handle:'muebles-para-tv',
            groups: [
              {label:'Centro de entretenimiento', handle:'antecomedores'},
              {label:'Sillones reclinables', handle:'sillones-reclinables'},
              {label:'Sofa Cama',handle:'sofa-cama'},
              {label:'Futon', handle:'futon'},
              {label:'Taburete',handle:'taburete'}
            ]
          },
          {
            isActive: false,
            label: 'Muebles de jardin',
            handle:'muebles-de-jardin',
            groups: [
              {label:'Mesas para jardin', handle:'mesas-para-jardin'},
              {label:'Sillas para jardin', handle:'sillas-para-jardin'},
              {label:'Camastro',handle:'camastro'},
              {label:'Sombrillas', handle:'sombrillas'},
              {label:'Salas para jardin',handle:'salas-para-jardin'}
            ]
          },
          {
            isActive: false,
            label: 'Muebles para oficina',
            handle:'muebles-para-oficina',
            groups: [
              {label:'Escritorios',handle:'escritorios'},
              {label:'Sillas para oficina', handle:'sillas-para-oficina'},
            ]
          }
        ]
      },

    ];

    return service;
  }

})();
