'use strict';

describe('Directive: myOperand', function () {

  // load the directive's module
  beforeEach(module('backtestClientApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<my-operand></my-operand>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the myOperand directive');
  }));
});
