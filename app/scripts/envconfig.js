"use strict";

 angular.module('envconfig', [])

.constant('ENV', {name:'dev',apiEndpoint:'http://sandbox-actual-api.herokuapp.com',adminUrl:'http://localhost:3000',tokenPrefix:'dev'})

;