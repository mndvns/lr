
var should = require('should');
var lrrc = require('../lib/lrrc');

describe('lrrc.read', function(){

  it('should read JSON strings', function(){
    lrrc.read('{"buzz": "bazz"}').should.eql({buzz: {cmd:'bazz', ignore: false}});
    lrrc.read('{"herp": "@derp"}').should.eql({herp: {cmd:'derp', ignore: true}});
    lrrc.read('{buzz: bazz}').should.throw();
  });

  it('should read yaml strings', function(){
    lrrc.read('foo: echo bar').should.eql({foo: {cmd:'echo bar', ignore: false}});
    lrrc.read('"aaa": "@bbb"').should.eql({aaa: {cmd:'bbb', ignore: true}});
    lrrc.read('foo:echo bar').should.throw();
  });

});
