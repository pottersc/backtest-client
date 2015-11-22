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
    'ui.bootstrap',
    'googlechart'
  ]).config(function ($routeProvider){
  $routeProvider
    .when('/',{
      templateUrl: 'views/welcome.html'
    })
    .when('/analysis', {
      templateUrl: 'views/analysis.html'
    })
    .when('/usersGuide', {
      templateUrl: 'views/usersGuide.html'
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
});
