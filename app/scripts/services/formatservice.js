(function (){
  //'use strict';

  angular.module('dashexampleApp')
    .factory('formatService', formatService);
    /*************************************************************/
    // NumeroALetras
    // The MIT License (MIT)
    //
    // Copyright (c) 2015 Luis Alfredo Chee
    //
    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the "Software"), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:
    //
    // The above copyright notice and this permission notice shall be included in all
    // copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    // SOFTWARE.
    //
    // @author Rodolfo Carmona
    // @contributor Jean (jpbadoino@gmail.com)
    /*************************************************************/
  /** @ngInject */
  function formatService($filter){

      function Unidades(num){

          switch(num)
          {
              case 1: return "UN";
              case 2: return "DOS";
              case 3: return "TRES";
              case 4: return "CUATRO";
              case 5: return "CINCO";
              case 6: return "SEIS";
              case 7: return "SIETE";
              case 8: return "OCHO";
              case 9: return "NUEVE";
          }

          return "";
      }//Unidades()

      function Decenas(num){

          var decena = Math.floor(num/10);
          var unidad = num -   (decena * 10);

          switch(decena)
          {
              case 1:
                  switch(unidad){
                      case 0: return "DIEZ";
                      case 1: return "ONCE";
                      case 2: return "DOCE";
                      case 3: return "TRECE";
                      case 4: return "CATORCE";
                      case 5: return "QUINCE";
                      default: return "DIECI" + Unidades(unidad);
                  }
              case 2:
                  switch(unidad)
                  {
                      case 0: return "VEINTE";
                      default: return "VEINTI" + Unidades(unidad);
                  }
              case 3: return DecenasY("TREINTA", unidad);
              case 4: return DecenasY("CUARENTA", unidad);
              case 5: return DecenasY("CINCUENTA", unidad);
              case 6: return DecenasY("SESENTA", unidad);
              case 7: return DecenasY("SETENTA", unidad);
              case 8: return DecenasY("OCHENTA", unidad);
              case 9: return DecenasY("NOVENTA", unidad);
              case 0: return Unidades(unidad);
          }
      }//Unidades()

      function DecenasY(strSin, numUnidades) {
          if (numUnidades > 0){
            return strSin + " Y " + Unidades(numUnidades);
          }

          return strSin;
      }//DecenasY()

      function Centenas(num) {
          var centenas = Math.floor(num / 100);
          var decenas = num - (centenas * 100);

          switch(centenas)
          {
              case 1:
                  if (decenas > 0)
                      return "CIENTO " + Decenas(decenas);
                  return "CIEN";
              case 2: return "DOSCIENTOS " + Decenas(decenas);
              case 3: return "TRESCIENTOS " + Decenas(decenas);
              case 4: return "CUATROCIENTOS " + Decenas(decenas);
              case 5: return "QUINIENTOS " + Decenas(decenas);
              case 6: return "SEISCIENTOS " + Decenas(decenas);
              case 7: return "SETECIENTOS " + Decenas(decenas);
              case 8: return "OCHOCIENTOS " + Decenas(decenas);
              case 9: return "NOVECIENTOS " + Decenas(decenas);
          }

          return Decenas(decenas);
      }//Centenas()

      function Seccion(num, divisor, strSingular, strPlural) {
          var cientos = Math.floor(num / divisor)
          var resto = num - (cientos * divisor)

          var letras = "";

          if (cientos > 0)
              if (cientos > 1)
                  letras = Centenas(cientos) + " " + strPlural;
              else
                  letras = strSingular;

          if (resto > 0)
              letras += "";

          return letras;
      }//Seccion()

      function Miles(num) {
          var divisor = 1000;
          var cientos = Math.floor(num / divisor)
          var resto = num - (cientos * divisor)

          var strMiles = Seccion(num, divisor, "UN MIL", "MIL");
          var strCentenas = Centenas(resto);

          if(strMiles === ""){
              return strCentenas;
          }

          return strMiles + " " + strCentenas;
      }//Miles()

      function Millones(num) {
          var divisor = 1000000;
          var cientos = Math.floor(num / divisor)
          var resto = num - (cientos * divisor)

          var strMillones = Seccion(num, divisor, "UN MILLON DE", "MILLONES DE");
          var strMiles = Miles(resto);

          if(strMillones == "")
              return strMiles;

          return strMillones + " " + strMiles;
      }//Millones()

      function numberToLetters(num) {
          var data = {
              numero: num,
              enteros: Math.floor(num),
              centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
              letrasCentavos: "",
              letrasMonedaPlural: 'Pesos',//"PESOS", 'Dólares', 'Bolívares', 'etcs'
              letrasMonedaSingular: 'Peso', //"PESO", 'Dólar', 'Bolivar', 'etc'

              letrasMonedaCentavoPlural: "CENTAVOS",
              letrasMonedaCentavoSingular: "CENTAVO"
          };

          if (data.centavos > 0) {
              data.letrasCentavos = "CON " + (function (){
                  if (data.centavos == 1){
                    return Millones(data.centavos) + " " + data.letrasMonedaCentavoSingular;
                  }
                  else{
                    return Millones(data.centavos) + " " + data.letrasMonedaCentavoPlural;
                  }
              })();
          }

          if(data.enteros === 0){
            return "CERO " + data.letrasMonedaPlural + " " + data.letrasCentavos;
          }
          if (data.enteros == 1){
            return Millones(data.enteros) + " " + data.letrasMonedaSingular + " " + data.letrasCentavos;
          }
          else{
            return Millones(data.enteros) + " " + data.letrasMonedaPlural + " " + data.letrasCentavos;
          }
      }//NumeroALetras()


      function yesNoFormat(data){
        return data ? 'Si' : 'No';
      }

      function nullFormat(data){
        return data ? data : 'No asignado';        
      }

      function dateTimeFormat(data){
        return $filter('date')(data, 'd/MMM/yyyy h:mm a');      
      }

      function dateFormat(data){
        return $filter('date')(data, 'd/MMM/yyyy');  
      }

      function currencyFormat(data){
        return $filter('currency')(data);
      }

      function rateFormat(data){
        return $filter('number')(data) + '%';
      }

      var service = {
        numberToLetters: numberToLetters,
        nullFormat: nullFormat,
        yesNoFormat: yesNoFormat,
        dateTimeFormat: dateTimeFormat,
        dateFormat: dateFormat,
        currencyFormat: currencyFormat,
        rateFormat: rateFormat
      };
      return service;

  }
})();
