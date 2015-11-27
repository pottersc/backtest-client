'use strict';

/**
 * @author Scott Potter
 * Simple controller that manages the active tab in the main application web page
 */
angular.module('backtestClientApp')
  .controller('NavCtrl', function ($scope, $location) {

    $scope.isActive = function(route) {
      return route === $location.path();
    };

  });
