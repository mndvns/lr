/**
 * Module dependencies
 */

var debug = require('debug')('lr:test:config');
var should = require('should');
var config = require('../lib/config');
var conf;

describe('config.read', function(){

  it('should read JSON strings', function(){
    conf = config.read('{"buzz": "bazz"}');
    conf.commands.buzz.cmd.should.eql('bazz');
    conf.commands.buzz.muted.should.be.false;

    conf = config.read('{"herp": "@derp"}');
    conf.commands.herp.cmd.should.eql('derp');
    conf.commands.herp.muted.should.be.true;

    config.read('{buzz: bazz}').should.throw();
  });

  it('should read yaml strings', function(){
    conf = config.read('buzz: bazz');
    conf.commands.buzz.cmd.should.eql('bazz');
    conf.commands.buzz.muted.should.be.false;

    conf = config.read("herp: '@derp'");
    conf.commands.herp.cmd.should.eql('derp');
    conf.commands.herp.muted.should.be.true;

    (function(){config.read('buzz:bazz')}).should.throw();
  });

  it('should read ini strings', function(){
    conf = config.read('buzz = bazz');
    conf.commands.buzz.cmd.should.eql('bazz');
    conf.commands.buzz.muted.should.be.false;

    conf = config.read("herp = @derp");
    conf.commands.herp.cmd.should.eql('derp');
    conf.commands.herp.muted.should.be.true;

    config.read('buzz =').should.throw();
  });


});

describe('config.loadPath', function(){

  it('should load yaml config', function(){
    conf = config.loadPath('test/fixtures/config/yaml');
    should.exist(conf);
    conf.should.be.an.object;
    conf.options['port'].should.eql(8888);
    conf.commands['*.js'].muted.should.be.true;
    conf.commands['*.html'].muted.should.be.false;
  });

  it('should load ini config', function(){
    conf = config.loadPath('test/fixtures/config/ini');
    should.exist(conf);
    conf.should.be.an.object;
    conf.options['port'].should.eql(8888);
    conf.commands['*.js'].muted.should.be.true;
    conf.commands['*.html'].muted.should.be.false;
  });

  it('should load json config', function(){
    conf = config.loadPath('test/fixtures/config/json');
    should.exist(conf);
    conf.should.be.an.object;
    conf.options['port'].should.eql(8888);
    conf.commands['*.js'].muted.should.be.true;
    conf.commands['*.html'].muted.should.be.false;
  });

});
