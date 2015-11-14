'use strict';

describe('Controller: AnalysisCtrl', function () {

  // load the controller's module
  beforeEach(module('backtestClientApp'));

  var AnalysisCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AnalysisCtrl = $controller('AnalysisCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(AnalysisCtrl.awesomeThings.length).toBe(3);
  });
});
