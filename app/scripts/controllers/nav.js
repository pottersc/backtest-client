/**
 * Created by Scott on 11/21/2015.
 */

angular.module('backtestClientApp')
  .controller('NavCtrl', function ($scope, $location) {

    $scope.isActive = function(route) {
      return route === $location.path();
    };

  });
