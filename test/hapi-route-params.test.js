"use strict";


var seneca = require('seneca')

var assert = require('assert')
var async = require('async')

var Hapi = require('hapi')
var server = Hapi.createServer('localhost', 8000)


var si = seneca()
si.use('../hapi.js')

si.add( {role:'hello'}, function(args, callback) {
  callback(null, {result: 'hello ' + args.name })
})

si.add( {role:'do', cmd: 'public'}, function(args, callback) {
  callback(null, 'public')
})

si.add( {role:'do', cmd: 'private'}, function(args, callback) {
  throw new Error('this command should not be accessible form HTTP')
})


si.add( {role:'calculation', cmd: 'add'}, function(args, callback) {
  var result = 0
  if(args.operands) {
    args.operands.forEach(function(operand) {
      result += operand
    })
  }
  callback(null, {result: result})
})

si.add( {role:'calculation', cmd: 'multiply'}, function(args, callback) {
  var result = 1
  if(args.operands) {
    args.operands.forEach(function(operand) {
      result *= operand
    })
  }
  callback(null, {result: result})
})

var hapiPin = si.pin({role: 'hapi', cmd: '*'})


describe('hapi', function () {

  it('url param', function (done) {
    hapiPin.attach({
      name: 'test1',
      version: '0.0.1',
      pack: server.pack,
      connectors: [{
          role: 'hello',
          path: '/hello/{name}'
        }
      ]
    }, function(err) {
      assert.ok(!err)

      var timestamp = Date.now()

      server.inject({
        method: 'post',
        url: '/hello/' + timestamp
      }, function(res) {
        assert.equal(res.statusCode, 200, res.payload)
        assert.ok(res.headers['content-type'], 'missing content-type headers')
        assert.ok(res.headers['content-type'].indexOf('application/json') > -1, 'missing application/json content-type headers')
        assert.ok(res.payload, 'missing response body')
        var payload = JSON.parse(res.payload)
        assert.ok(payload.result, 'hello '+ timestamp)
        done()
      })
    })
  })

  it('url param takes precedence over post param', function (done) {

    var timestamp = Date.now()

    server.inject({
      method: 'post',
      url: '/hello/' + timestamp,
      payload: JSON.stringify({name: 'foobar'})
    }, function(res) {
      assert.equal(res.statusCode, 200, res.payload)
      assert.ok(res.headers['content-type'], 'missing content-type headers')
      assert.ok(res.headers['content-type'].indexOf('application/json') > -1, 'missing application/json content-type headers')
      assert.ok(res.payload, 'missing response body')
      var payload = JSON.parse(res.payload)
      assert.ok(payload.result, 'hello '+ timestamp)
      done()
    })
  })

  it('url param takes precedence over get param', function (done) {
    hapiPin.attach({
      name: 'test3',
      version: '0.0.1',
      pack: server.pack,
      connectors: [{
          role: 'hello',
          path: '/hello/{name}',
          method: 'get'
        }
      ]
    }, function(err) {
      assert.ok(!err)

      var timestamp = Date.now()

      server.inject({
        method: 'get',
        url: '/hello/' + timestamp+'?name=foobar'
      }, function(res) {
        assert.equal(res.statusCode, 200, res.payload)
        assert.ok(res.headers['content-type'], 'missing content-type headers')
        assert.ok(res.headers['content-type'].indexOf('application/json') > -1, 'missing application/json content-type headers')
        assert.ok(res.payload, 'missing response body')
        var payload = JSON.parse(res.payload)
        assert.ok(payload.result, 'hello '+ timestamp)
        done()
      })
    })
  })

  it('it is not possible to override the cmd', function (done) {
    hapiPin.attach({
      name: 'test4',
      version: '0.0.1',
      pack: server.pack,
      connectors: [{
          role: 'do',
          cmd: 'public',
          path: '/do/{cmd}'
        }
      ]
    }, function(err) {
      assert.ok(!err)

      var timestamp = Date.now()

      server.inject({
        method: 'post',
        url: '/do/private?cmd=private',
        payload: JSON.stringify({cmd: 'private'})
      }, function(res) {
        assert.equal(res.statusCode, 200, res.payload)
        assert.equal(res.payload, 'public')
        done()
      })
    })
  })


})
