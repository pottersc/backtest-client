'use strict';

/**
 * @ngdoc overview
 * @name backtestClientApp
 * @description
 * # backtestClientApp
 *
 * Main module of the application.
 */
angular
  .module('backtestClientApp', [
    'ngAnimate',
    'ngRoute',
    'ui.bootstrap'
  ]).config(function ($routeProvider){
  $routeProvider
    .when('/',{
      templateUrl: 'views/main.html',
      controller: 'MainCtrl',
      controllerAs: 'main'
    })
    .when('/analysis', {
      templateUrl: 'views/analysis.html',
      controller: 'AnalysisCtrl',
      controllerAs: 'analysis'
    })
    .when('/about',{
      templateUrl: 'views/about.html',
      controller: 'AboutCtrl',
      controllerAs: 'about'
    })
    .when('/contact', {
      templateUrl: 'views/contact.html',
      controller: 'ContactCtrl',
      controllerAs: 'contact'
    })
    .otherwise({
      redirectTo: '/'
    });
});
