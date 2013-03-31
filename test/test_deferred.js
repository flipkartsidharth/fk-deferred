/*jshint globalstrict: true */
/*global require: true, describe: true, it: true*/

'use strict';

var deferred = require('../deferred.js'),
    assert = require("assert");


deferred.setDefaultMonitor({
    unhandledException: function(ex) {
        throw new Error("Got an unhandled exception");
    },
    expectationFailed: function(msg) {
        throw new Error('Expectation failed: ' + msg);
    }
});

describe('deferred.success', function(){
    it('should execute a success callback passed to it', function (done) {
        var s = deferred.success("hello");
        s.success(function (res) {
            assert.equal("hello", res);
            done();
        });
    });
});

describe('deferred.lift', function(){
    it('it should convert modify a function so that it returns a deferred', function (done) {
        function f(param) {
            assert.equal("param", param);
            return "value";
        }
        var liftedF = deferred.lift(f);
        liftedF("param").success(function (value) {
            assert.equal("value", value);
            done();
        });
    });
});

describe('deferred.combine', function () {
    it('should combine multiple deferreds', function (done) {
        var d1 = deferred.success("d1");
        var d2 = deferred.success("d2");
        var c = deferred.combine({d1: d1, d2: d2});
        c.success(function (result) {
            assert.equal("d1", result.d1);
            assert.equal("d2", result.d2);
            done();
        });
    });
});

describe('deferred#pipeFailure', function () {
    it('should be ignored if the result is a success', function (done) {
        var d = deferred.success("d");
        var r = d.pipeFailure(function() {
            throw new Error();
        });
        r.success(function (d) {
            assert.equal(d, "d");
            done();
        }).failure(function () {
            throw new Error();
        });
    });
});

describe('deferred#failure', function () {
    it('should be called if an uncaught exception is thrown while executing the deferred', function () {
        deferred.defer(function () {
            throw new Error("Killing this deferred");
        }).failure(function (e) {
            assert.equal(e.ex.message, "Killing this deferred");
        });
    });
});