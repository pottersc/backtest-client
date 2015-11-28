'use strict';

/**
 * @author Scott Potter
 * Service that prepares the chart that displays the results of a backtest analysis.
 * The chart includes 1) stock price line, 2) investment value line, and 3) a line for each unique
 * trading indicator such as simple moving average for specified number of days.
 * The google chart wrapper directive from https://github.com/angular-google-chart/angular-google-chart
 * is used to simplify the chart creation and provide added features such as dynamic hiding of chart lines.
 * This charting capability follows the requirements specified in the google chart documentation at
 * https://developers.google.com/chart/interactive/docs/gallery/linechart
 */

backtestClientApp.service('backtestChartService', ['googleChartApiPromise', '$filter', function (googleChartApiPromise, $filter) {

  /**
   * Build the chart object for display using google charts
   * This implementation uses the google 'DataTable' approach which results in simpler coding.
   * However, this approach runs slower when generating charts with a large amount of data.  The performance when
   * running on mobile devices is poor, and therefore a future enhancement that utilizes the 'Javascript Literal Object'
   * approach as described in https://developers.google.com/chart/interactive/docs/datatables_dataviews
   * would result in improved performance.
   * @param backtestResults : result object as returned from backtest analysis web service
   * @returns chartObject : as required by google charts
   */
  this.buildChart = function (backtestResults) {
    var chartObject = {};
    chartObject.type = 'LineChart';
    chartObject.displayed = false;
    var data = new google.visualization.DataTable();
    // define the columns for the chart
    data.addColumn('date', 'Trade Date');
    data.addColumn('number', 'Stock Price');
    data.addColumn({type: 'string', role: 'annotation'}); // annotation role col.
    data.addColumn({type: 'string', role: 'annotationText'}); // annotationText col.
    data.addColumn('number', 'Investment Value');
    // add additional columns as required for the number of trade indicators in backtest result data
    $.each(backtestResults.indicators, function (indicatorIndex, indicator) {
      data.addColumn('number', indicator.name);
    });
    // add the data for the chart for each trade day
    data.addRows(backtestResults.tradeDays.length);
    $.each(backtestResults.tradeDays, function (index, tradeDay) {
      data.setCell(index, 0, createDate(tradeDay.date));
      data.setCell(index, 1, (tradeDay.stockPrice));
      data.setCell(index, 2, getTradeAnnotation(tradeDay));
      data.setCell(index, 3, getTradeAnnotationText(tradeDay));
      data.setCell(index, 4, (tradeDay.investmentValue));
      var colIndex = 5;
      $.each(backtestResults.indicators, function (indicatorIndex, indicator) {
        var indicatorDay = findIndicatorDay(indicator, tradeDay.date);
        if (indicatorDay != null) {
          data.setCell(index, colIndex, indicatorDay.value);
        }
        colIndex++;
      });
    });

    // define all of the chart options
    var options = {
      title: 'Backtest Analysis Results: Ending Investment=' + $filter('currency')(backtestResults.endingInvestment),
      legend: {position: 'top', maxLines: 2},
      displayAnnotations: true,
      explorer: {
        maxZoomOut: 1,
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
    // initialize data for the 'hideSeries' capability
    var numColumnsToView = 5 + backtestResults.indicators.length;
    chartObject.view = {
      columns: initializeViewArray(numColumnsToView)
    };
    return chartObject;
  }

  /**
   * Allows a user to hide/show a chart line by selecting the line in the chart legend
   * Follows the template defined at
   * http://angular-google-chart.github.io/angular-google-chart/docs/latest/examples/hide-series/
   * @param selectedItem  : The chart line (in the legend) that the user clicked on to enable hiding
   * @param chartObject : the chartObject that is currently displayed to the user
   */
  this.hideSeries = function (selectedItem, chartObject) {
    var col = selectedItem.column;
    if (selectedItem.row === null) {
      if (chartObject.view.columns[col] == col) {
        chartObject.view.columns[col] = {
          label: chartObject.data.cols[col].label,
          type: chartObject.data.cols[col].type,
          calc: function () {
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

  /**
   * Initialize an array of all the series (lie lines) that are to be displayed in the chart to be used
   * in the 'hideSeries' function.
   * @param numCols : number of lines (series) displayed on the chart
   * @returns {Array} : ex [0,1,2,3,4] if there are 5 lines on the chart
   */
  function initializeViewArray(numCols) {
    var viewArray = [];
    for (var i = 0; i < numCols; i++) {
      viewArray.push(i);
    }
    return viewArray;
  }

  /**
   * Create teh annotation that will be displayed on chart when any important transaction occurred
   * Basically disply either BUT or SELL text as appropriate
   * @param tradeDay : tradeDay object as returned from backtest service
   * @returns : string containing the annotation
   */
  function getTradeAnnotation(tradeDay) {
    var annotation;
    if (tradeDay.action == 'BUY' || tradeDay.action == 'SELL') {
      annotation = tradeDay.action;
    } else {
      annotation = null;
    }
    return annotation;
  }

  /**
   * Create and return an annotation to be displayed when a user hovers over a data point in the chart
   * @param tradeDay :tradeDay object as returned from backtest service
   * @returns {string} : detailed description of the transaction that occurred on the specified tradeDay
   */
  function getTradeAnnotationText(tradeDay) {
    return tradeDay.action + ' ' + $filter('number')(tradeDay.numberSharesTraded) + ' shares at ' + (tradeDay.stockPrice) + ' on ' + $filter('date')(tradeDay.date) + ' with proceeds of ' + $filter('currency')(tradeDay.investmentValue);
  }

  /**
   * Transform dataTable object so that is is acceptable to googleChart
   * This function needs additional attention as there has to be a better way to clean up the dataTable object
   * @param dataTableObject
   */
  function normalizeGoogleDataTableObject(dataTableObject) {
    return JSON.parse(JSON.parse(JSON.stringify(dataTableObject)));
  }

  /**
   * Create a javascript Date object from the specified date string
   * @param dateString : format is yyyy-MM-dd
   * @returns {Date} : javascript Date object
   */
  function createDate(dateString) {
    var res = dateString.split("-");
    return new Date(res[0], res[1] - 1, res[2]);
  }

  /**
   * search thru the indicatorDays array to find and return the indicatorDay for the specified data
   * @param indicator
   * @param date
   * @returns {*}
   */
  function findIndicatorDay(indicator, date) {
    for (var i = 0; i < indicator.indicatorDays.length; i++) {
      if (indicator.indicatorDays[i].date == date) {
        return indicator.indicatorDays[i];
      }
    }
    var errMsg = "Error:findIndicatorDay(" + indicator + "," + date + ") Not Found";
    alert(errMsg, {type: 'danger'});
    return null;
  }

}]);
