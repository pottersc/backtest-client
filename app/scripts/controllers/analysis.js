'use strict';

/**
 * @ngdoc function
 * @name backtestClientApp.controller:AnalysisCtrl
 * @description
 * # AnalysisCtrl
 * Controller of the backtestClientApp
 */
angular.module('backtestClientApp')
  .controller('AnalysisCtrl', function ($scope, $http, $filter, googleChartApiPromise) {
    var host = "http://localhost:8080";
 //   var host = "http://backtestservice-pottersc.rhcloud.com/";

    $scope.navTarget = 'home';
    $scope.navTo = function(target){
      $scope.navTarget = target;
      console.log('target = '+ $scope.navTarget);
    }


      $scope.relationalOperatorChoices=[
        {name: "EQUALS", symbol: "="},
        {name: "GREATER_THAN", symbol: ">"},
        {name: "LESS_THAN", symbol: "<"}
      ];

    //{name: "BOLLINGER", label: "Bollinger Bands", value1: 0, value1Label: "Period", value2: 0, value2Label: "StdDev"},
      $scope.strategyChoices=[
        {name: "SMA", label: "Moving Average", value1: 0, value1Label: "Period", value2: 0, value2Label: ""},
        {name: "EMA", label: "Exp Moving Average", value1: 0, value1Label: "Period", value2: 0, value2Label: ""},
        {name: "FIX", label: "Fixed Value", value1: 0, value1Label: " ", value2: 0, value2Label: ""},
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
            strategyName: "CLOSE",
            value1: 0,
            value2: 0
          },
          operatorName: "GREATER_THAN",
          operand2: {
            strategyName: "SMA",
            value1: 3,
            value2: 0
          },
        },
        sellTrigger: {
          operand1: {
            strategyName: "CLOSE",
            value1: 0,
            value2: 0
          },
          operatorName: "LESS_THAN",
          operand2: {
            strategyName: "SMA",
            value1: 6,
            value2: 0
          },
        }
      };

      $scope.scenario.startDate = new Date(2015,4,1);
      $scope.scenario.endDate = new Date(2015,5,1); //Date();
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



    // Setup bindable objects
    $scope.chartObject = {};
    $scope.hideSeries = hideSeries;

    function hideSeries(selectedItem) {
      var col = selectedItem.column;
      if (selectedItem.row === null) {
        if ($scope.chartObject.view.columns[col] == col) {
          $scope.chartObject.view.columns[col] = {
            label: $scope.chartObject.data.cols[col].label,
            type: $scope.chartObject.data.cols[col].type,
            calc: function() {
              return null;
            }
          };
          $scope.chartObject.options.colors[col - 1] = '#CCCCCC';
        }
        else {
          $scope.chartObject.view.columns[col] = col;
          $scope.chartObject.options.colors[col - 1] = $scope.chartObject.options.defaultColors[col - 1];
        }
      }
    }

    $scope.runAnalysis = function(){
      $scope.scenario.startDate = $filter('date')($scope.scenario.startDate, "yyyy-MM-dd");
      $scope.scenario.endDate =  $filter('date')($scope.scenario.endDate, "yyyy-MM-dd");
      $http.post(host+"/backtest/runAnalysis", $scope.scenario).success(function (backtestResults, status) {
        //  $scope.backtestResults = backtestResults;
        googleChartApiPromise.then(buildChart(backtestResults));
        //  console.log("runAnalysis:chartObject");
        //   console.log($scope.chartObject);
      }).error(function(backtestResults, status){
        console.log("error was found" + status + ":" + backtestResults);
      });
    };


    function buildChart(backtestResults){
      $scope.chartObject.type = 'LineChart';
      $scope.chartObject.displayed = false;
      var data = new google.visualization.DataTable();

      data.addColumn('date','Trade Date');
      data.addColumn('number','Stock Price');
      data.addColumn({type:'string', role:'annotation'}); // annotation role col.
      data.addColumn({type:'string', role:'annotationText'}); // annotationText col.
      data.addColumn('number','Investment Value');

      jQuery.each(backtestResults.indicators , function(indicatorIndex, indicator){
        data.addColumn('number',indicator.name);
      });

      data.addRows(backtestResults.tradeDays.length);
      jQuery.each(backtestResults.tradeDays , function(index, tradeDay){
        data.setCell(index,0, createDate(tradeDay.date));
        data.setCell(index,1,tradeDay.stockPrice);
        data.setCell(index,2, getTradeAnnotation(tradeDay));
        data.setCell(index,3,getTradeAnnotationText(tradeDay));
        data.setCell(index,4,tradeDay.investmentValue);

        var colIndex = 5;
          jQuery.each(backtestResults.indicators , function(indicatorIndex, indicator){
          var indicatorDay = findIndicatorDay(indicator, tradeDay.date);
          if(indicatorDay!=null){
            data.setCell(index,colIndex,indicatorDay.value);
          }
          colIndex++;
        });
      });

      var options = {
        title: 'Backtest Analysis Results: Ending Investment='+backtestResults.endingInvestment,
        legend: { position: 'top', maxLines: 2},
        displayAnnotations: true,
        explorer: {
          maxZoomOut:1,
          maxZoomIn: 0.1,
          keepInBounds: true,
          axis: 'horizontal'

        },
        "colors": ['#0000FF', '#009900', '#CC0000', '#DD9900', '#000000', '#ff33cc', '#99ccff', '#ff9966', '#666633'],
        "defaultColors": ['#0000FF', '#009900', '#CC0000', '#DD9900', '#000000', '#ff33cc', '#99ccff', '#ff9966', '#666633'],
        series: {
          0: {targetAxisIndex: 0},
          1: {targetAxisIndex: 1}
        },
        vAxes: {
          // Adds titles to each axis.
          0: {title: 'Stock Price ($)'},
          1: {title: 'Investment Value ($)'}
        }
      };
      $scope.chartObject.options = options;
      $scope.chartObject.data = normalizeGoogleDataTableObject(data);
      var numColumnsToView = 5 + backtestResults.indicators.length;
      $scope.chartObject.view = {
        columns: initializeViewArray(numColumnsToView)
      };
    }

    function initializeViewArray(numCols){
      var viewArray = [];
      for(var i =0;i<numCols;i++){
        viewArray.push(i);
      }
      return viewArray;
    }

    function getTradeAnnotation(tradeDay){
      var annotation;
      if(tradeDay.action=='BUY' || tradeDay.action=='SELL') {
        annotation = tradeDay.action;
      }else{
        annotation = null;
      }
      return annotation;
    }

    function getTradeAnnotationText(tradeDay){
      return tradeDay.action + ' ' + $filter('number')(tradeDay.numberSharesTraded) + ' shares at ' + $filter('currency')(tradeDay.stockPrice) + ' on '+ $filter('date')(tradeDay.date) + ' with proceeds of ' + $filter('currency')(tradeDay.investmentValue);
    }

    function normalizeGoogleDataTableObject(dataTableObject){
      return JSON.parse(JSON.parse(JSON.stringify(dataTableObject)));
    }

    function createDate(dateString){
      var res = dateString.split("-");
      return new Date(res[0],res[1]-1,res[2]);
    }
    function findIndicatorDay(indicator, date){
      for( var i=0; i<indicator.indicatorDays.length; i++){
        if(indicator.indicatorDays[i].date == date){
          return indicator.indicatorDays[i];
        }
      }
      var errMsg = "Error:findIndicatorDay("+indicator+","+ date+") Not Found";
      $.bootstrapGrowl(errMsg, { type: 'danger' });
      return null;
    }


    });
