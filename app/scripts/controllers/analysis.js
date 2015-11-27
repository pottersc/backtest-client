'use strict';

/**
 * @author Scott Potter
 * Run a backtest analysis scenario by making an http POST to the analysis web service and passing the
 * 'scenario' that the user has specified in the user interface.
 * This module is also responsible for initializing the backtest 'scenario' model that will be presented to the user
 */
angular.module('backtestClientApp')
  .controller('AnalysisCtrl', function ($scope, $http, $filter, googleChartApiPromise, backtestChartService, $sce, $loading, envService) {
    // utilize the appropriate 'backtestServiceUrl' setting depending on if this is running in development or production
    // The target URL options are configured in the 'app.js' file
    var backtestServiceUrl = envService.read('backtestServiceUrl');

    // Initialize 'relationalOperatorChoices' via a request to the backtest service so that the future addition of new
    // operators will not require any client side code changes
    $scope.relationalOperatorChoices = null;
    $http.get(backtestServiceUrl + "/backtest/relationalOperators").
    then(function (response) {
      $scope.relationalOperatorChoices = response.data;
    }, function (response) {
      alert('Error: cannot read relationalOperatorChoices from server. error=' + response.status + ': response=' + response.data);
    });

    // Initialize 'strategyChoices' object.
    // Currently this is hard coded, but a future code release should initialize this based on a request to the
    // backtest web service in order to allow new strategies to be added without the need for client side code changes
    $scope.strategyChoices = [
      {name: "SMA", label: "Moving Average", value1: 0, value1Label: "Period", value2: 0, value2Label: ""},
      {name: "EMA", label: "Exp Moving Average", value1: 0, value1Label: "Period", value2: 0, value2Label: ""},
      {name: "FIX", label: "Fixed Value", value1: 0, value1Label: " ", value2: 0, value2Label: ""},
      {name: "CLOSE", label: "Closing Price", value1: 0, value1Label: "", value2: 0, value2Label: ""}
    ];

    // Initialize a default configuration for a backtest scenario
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

    // Initialize the scenario startData and endDates and also the corresponding requirements for supporting the
    // corresponding bootstrap datepicker component as described at https://angular-ui.github.io/bootstrap/
    $scope.scenario.startDate = new Date(2000, 0, 1);
    $scope.scenario.endDate = new Date();
    $scope.dateFormat = 'yyyy-MM-dd';
    $scope.minDate = $scope.minDate ? null : new Date(1900, 1, 1);
    $scope.maxDate = new Date();
    // Disable weekend selection
    $scope.disabled = function (date, mode) {
      return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };
    $scope.openStartDateEditor = function () {
      $scope.startDateEditorStatus.opened = true;
    };
    $scope.startDateEditorStatus = {
      opened: false
    };
    $scope.openEndDateEditor = function () {
      $scope.endDateEditorStatus.opened = true;
    };
    $scope.endDateEditorStatus = {
      opened: false
    };

    // Initialize objects used for charting results
    $scope.chartObject = null;
    $scope.chartHelp = $sce.trustAsHtml("Roll mouse on chart to zoom<br>Hold left mouse button to pan left/right<br>Hover over buy/sell tags to view details<br>Click on legend to hide/show chart lines");
    $scope.hideSeries = backtestChartService.hideSeries;

    /**
     * Execute a backtest analysis by passing the user configured scenario object to the backtest web service
     * The response is passed to the backtestChartService in order to build the chart for display
     */
    $scope.runAnalysis = function () {
      $scope.scenario.startDate = $filter('date')($scope.scenario.startDate, "yyyy-MM-dd");
      $scope.scenario.endDate = $filter('date')($scope.scenario.endDate, "yyyy-MM-dd");
      $loading.start('executingAnalysis');  // start the spinner
      $http.post(backtestServiceUrl + "/backtest/runAnalysis", $scope.scenario).success(function (backtestResults) {
        googleChartApiPromise.then($scope.chartObject = backtestChartService.buildChart(backtestResults));
        $loading.finish('executingAnalysis');  // stop the spinner
      }).error(function (backtestResults, status) {
        $loading.finish('executingAnalysis');
        alert("An error occurred while generating the backtest chart.  errorCode=" + status + ": backtestResults=" + backtestResults);
      });
    };

  });
