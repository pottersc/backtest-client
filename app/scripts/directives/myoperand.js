'use strict';

/**
 * @author Scott Potter
 * Define the 'myOperand' directive that describes one half of either a buy or sell strategy
 * Basically the operand is considered anything on either the left or right side of a relational operator
 * in the definition of the trade strategy.
 * An example of an operand is '50 day Simple Moving Average' or 'Closing Stock Price'
 */
angular.module('backtestClientApp')
  .directive('myOperand', function () {
    return {
      restrict: 'E',  // only match element name
      templateUrl: 'views/my-operand.html',
      scope: {
        operand: '=',
        strategyChoices: '=',
        name: '='
      },
      link: function(scope) {
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
