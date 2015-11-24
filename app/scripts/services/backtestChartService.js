'use strict';

/**
 * Created by Scott on 11/23/2015.
 */

backtestClientApp.service('backtestChartService',['googleChartApiPromise', '$filter', function(googleChartApiPromise, $filter){

  this.buildChart = function(backtestResults){
    var chartObject = {};
    chartObject.type = 'LineChart';
    chartObject.displayed = false;
    var data = new google.visualization.DataTable();

    data.addColumn('date','Trade Date');
    data.addColumn('number','Stock Price');
    data.addColumn({type:'string', role:'annotation'}); // annotation role col.
    data.addColumn({type:'string', role:'annotationText'}); // annotationText col.
    data.addColumn('number','Investment Value');

    $.each(backtestResults.indicators , function(indicatorIndex, indicator){
      data.addColumn('number',indicator.name);
    });


    data.addRows(backtestResults.tradeDays.length);
    $.each(backtestResults.tradeDays , function(index, tradeDay){
      data.setCell(index,0, createDate(tradeDay.date));
      data.setCell(index,1,tradeDay.stockPrice);
      data.setCell(index,2, getTradeAnnotation(tradeDay));
      data.setCell(index,3,getTradeAnnotationText(tradeDay));
      data.setCell(index,4,tradeDay.investmentValue);

      var colIndex = 5;
      $.each(backtestResults.indicators , function(indicatorIndex, indicator){
        var indicatorDay = findIndicatorDay(indicator, tradeDay.date);
        if(indicatorDay!=null){
          data.setCell(index,colIndex,indicatorDay.value);
        }
        colIndex++;
      });
    });

    var options = {
      title: 'Backtest Analysis Results: Ending Investment='+ $filter('currency')(backtestResults.endingInvestment),
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
    chartObject.options = options;
    chartObject.data = normalizeGoogleDataTableObject(data);
    var numColumnsToView = 5 + backtestResults.indicators.length;
    chartObject.view = {
      columns: initializeViewArray(numColumnsToView)
    };
    return chartObject;
  }


  this.hideSeries = function(selectedItem, chartObject) {
    var col = selectedItem.column;
    if (selectedItem.row === null) {
      if (chartObject.view.columns[col] == col) {
        chartObject.view.columns[col] = {
          label: chartObject.data.cols[col].label,
          type: chartObject.data.cols[col].type,
          calc: function() {
            return null;
          }
        };
        chartObject.options.colors[col - 1] = '#CCCCCC';
      }
      else {
        chartObject.view.columns[col] = col;
        chartObject.options.colors[col - 1] = chartObject.options.defaultColors[col - 1];
      }
    }
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
    return tradeDay.action + ' ' + $filter('number')(tradeDay.numberSharesTraded) + ' shares at ' + (tradeDay.stockPrice) + ' on '+ $filter('date')(tradeDay.date) + ' with proceeds of ' + $filter('currency')(tradeDay.investmentValue);
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
    alert(errMsg, { type: 'danger' });
    return null;
  }

}]);
