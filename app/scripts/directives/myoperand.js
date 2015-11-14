'use strict';

/**
 * @ngdoc directive
 * @name backtestClientApp.directive:myOperand
 * @description
 * # myOperand
 */
angular.module('backtestClientApp')
  .directive('myOperand', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/my-operand.html',
      scope: {
        operand: '=',
        strategyChoices: '=',
        name: '='
      },
      link: function(scope, el, attr) {
        scope.getStrategy = function(strategyName, strategyChoices){
          var strategy = null;
          for(var i=0;i<strategyChoices.length;i++){
            if(strategyChoices[i].name == strategyName){
              strategy = strategyChoices[i];
            }
          }
          return strategy;
        };
      }
    };
  });
