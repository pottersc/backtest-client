'use strict';

/**
 * @author Scott Potter
 * Main module of the application.
 * Configure application dependencies and  routes.
 * Also, configure environment variables that need to change when switching from development to production environments
 */
var backtestClientApp = angular
  .module('backtestClientApp', [
    'ngAnimate',
    'ngRoute',
    'ui.bootstrap',
    'googlechart',
    'darthwade.dwLoading',
    'environment'
  ]).config(function ($routeProvider, envServiceProvider){
  $routeProvider
    .when('/',{
      templateUrl: 'views/welcome.html'
    })
    .when('/analysis', {
      templateUrl: 'views/analysis.html'
    })
    .when('/about',{
      templateUrl: 'views/about.html'
    })
    .when('/contact', {
      templateUrl: 'views/contact.html'
    })
    .otherwise({
      redirectTo: '/'
    });
    // environment profiles are configured using 'angular-environment' package
    // described at https://www.npmjs.com/package/angular-environment
    envServiceProvider.config({
      domains: {
        development: ['localhost'],
        production: ['rhcloud.com','backtest-pottersc.rhcloud.com/']
      },
      vars: {
        development: {
          backtestServiceUrl: 'http://localhost:8080'
        },
        production: {
          backtestServiceUrl: 'http://backtestservice-pottersc.rhcloud.com'
        }
      }
    });
    // This must be called here in order to configure environment profiles
    envServiceProvider.check();
});


