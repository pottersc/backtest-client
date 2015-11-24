'use strict';

/**
 * @ngdoc function
 * @name backtestClientApp.controller:AnalysisCtrl
 * @description
 * # AnalysisCtrl
 * Controller of the backtestClientApp
 */
angular.module('backtestClientApp')
  .controller('AnalysisCtrl', function ($scope, $http, $filter, googleChartApiPromise, backtestChartService, $sce, $loading) {
    var host = "http://localhost:8080";
  //  var host = "http://backtestservice-pottersc.rhcloud.com/";


    $scope.relationalOperatorChoices = null;
    $http.get(host+"/backtest/relationalOperators").
      then(function (response) {
        $scope.relationalOperatorChoices = response.data;
      },function (response) {
        alert('Error: cannot read relationalOperatorChoices from server. error='+response.status+': response='+response.data);
      });



      $scope.strategyChoices=[
        {name: "SMA", label: "Moving Average", value1: 0, value1Label: "Period", value2: 0, value2Label: ""},
        {name: "EMA", label: "Exp Moving Average", value1: 0, value1Label: "Period", value2: 0, value2Label: ""},
        {name: "FIX", label: "Fixed Value", value1: 0, value1Label: " ", value2: 0, value2Label: ""},
        {name: "CLOSE", label: "Closing Price", value1: 0, value1Label: "", value2: 0, value2Label: ""}
      ];

      $scope.scenario = {
        tickerSymbol: "AAPL",
        startDate: "",
        endDate: "",
        startingInvestment: 10000,
        transactionCost: 10,
        buyTrigger: {
          operand1: {
            strategyName: "SMA",
            value1: 50,
            value2: 0
          },
          operatorName: "GREATER_THAN",
          operand2: {
            strategyName: "SMA",
            value1: 200,
            value2: 0
          },
        },
        sellTrigger: {
          operand1: {
            strategyName: "SMA",
            value1: 50,
            value2: 0
          },
          operatorName: "LESS_THAN",
          operand2: {
            strategyName: "SMA",
            value1: 200,
            value2: 0
          },
        }
      };

      $scope.scenario.startDate = new Date(2000,0,1);
      $scope.scenario.endDate = new Date();; //Date(2015,5,1); //Date();
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


    $scope.chartObject = null;
    $scope.chartHelp = $sce.trustAsHtml("Roll mouse on chart to zoom<br>Hold left mouse button to pan left/right<br>Hover over buy/sell tags to view details<br>");
    $scope.hideSeries = backtestChartService.hideSeries;


    $scope.runAnalysis = function(){
      $scope.scenario.startDate = $filter('date')($scope.scenario.startDate, "yyyy-MM-dd");
      $scope.scenario.endDate =  $filter('date')($scope.scenario.endDate, "yyyy-MM-dd");
      $loading.start('executingAnalysis');
      $http.post(host+"/backtest/runAnalysis", $scope.scenario).success(function (backtestResults) {
        googleChartApiPromise.then($scope.chartObject = backtestChartService.buildChart(backtestResults));
        $loading.finish('executingAnalysis');
      }).error(function(backtestResults, status){
        $loading.finish('executingAnalysis');
        alert("An error occurred while generating the backtest chart.  errorCode=" + status + ": backtestResults=" + backtestResults);
      });
    };

  });
