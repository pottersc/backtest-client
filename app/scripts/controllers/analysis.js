'use strict';

/**
 * @ngdoc function
 * @name backtestClientApp.controller:AnalysisCtrl
 * @description
 * # AnalysisCtrl
 * Controller of the backtestClientApp
 */
angular.module('backtestClientApp')
  .controller('AnalysisCtrl', function ($scope, $http, $filter) {

      $scope.relationalOperatorChoices=[
        {name: "EQUALS", symbol: "="},
        {name: "GREATER_THAN", symbol: ">"},
        {name: "LESS_THAN", symbol: "<"}
      ];

      $scope.strategyChoices=[
        {name: "SMA", label: "Moving Average", value1: 0, value1Label: "Period", value2: 0, value2Label: ""},
        {name: "EMA", label: "Exp Moving Average", value1: 0, value1Label: "Period", value2: 0, value2Label: ""},
        {name: "FIX", label: "Fixed Value", value1: 0, value1Label: " ", value2: 0, value2Label: ""},
        {name: "PRICE", label: "Stock Price", value1: 0, value1Label: "$", value2: 0, value2Label: ""},
        {name: "BOLLINGER", label: "Bollinger Bands", value1: 0, value1Label: "Period", value2: 0, value2Label: "StdDev"},
        {name: "CLOSE", label: "Closing Price", value1: 0, value1Label: "", value2: 0, value2Label: ""}
      ];

      $scope.scenario = {
        tickerSymbol: "MSI",
        startDate: "",
        endDate: "",
        startingInvestment: 10000,
        transactionCost: 10,
        buyTrigger: {
          operand1: {
            strategyName: "SMA",
            value1: 5,
            value2: 0
          },
          operatorName: "GREATER_THAN",
          operand2: {
            strategyName: "SMA",
            value1: 2,
            value2: 0
          },
        },
        sellTrigger: {
          operand1: {
            strategyName: "SMA",
            value1: 2,
            value2: 0
          },
          operatorName: "GREATER_THAN",
          operand2: {
            strategyName: "SMA",
            value1: 1,
            value2: 0
          },
        }
      };

      $scope.scenario.startDate = new Date(2015,4,1);
      $scope.scenario.endDate = new Date(2015,5,1); //Date();


      $scope.runAnalysis = function(){
        $scope.scenario.startDate = $filter('date')($scope.scenario.startDate, "yyyy-MM-dd");
        $scope.scenario.endDate =  $filter('date')($scope.scenario.endDate, "yyyy-MM-dd");
        $http.post("http://localhost:9001/backtest/runAnalysis", $scope.scenario).success(function (responseData, status) {
          $scope.results = responseData;
          console.log("results="+responseData);
        }).error(function(responseData, status){
          console.log("error was found" + status + ":" + responseData);
        });
      };



      $scope.dateFormat = 'yyyy-MM-dd';
      $scope.minDate = $scope.minDate ? null : new Date(1900,1,1);
      $scope.maxDate = new Date();

      // Disable weekend selection
      $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
      };

      $scope.openStartDateEditor = function($event) {
        $scope.startDateEditorOpened = true;
      };
      $scope.startDateEditorOpened = false;

      $scope.openEndDateEditor = function($event) {
        $scope.endDateEditorOpened = true;
      };
      $scope.endDateEditorOpened = false;

    });
