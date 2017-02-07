"use strict";

 angular.module('envconfig', [])

.constant('ENV', {name:'dev',apiEndpoint:'http://localhost:1337',adminUrl:'http://localhost:3000',tokenPrefix:'dev'})

;