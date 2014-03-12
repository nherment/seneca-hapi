"use strict";


var seneca = require('seneca')

var assert = require('assert')

var Hapi = require('hapi')
var server = Hapi.createServer('localhost', 8000)


var si = seneca()
si.use('../hapi.js')

si.add( {role:'ping'}, function(args, callback) {
  callback(null, 'pong')
})

si.add( {role:'hello'}, function(args, callback) {
  callback(null, {result: 'hello ' + args.name })
})


var hapiPin = si.pin({role: 'hapi', cmd: '*'})


describe('hapi', function () {

  it('ping', function (done) {
    hapiPin.attach({
      name: 'test1',
      version: '0.0.1',
      pack: server.pack,
      connectors: [{
          role: 'ping'
        }
      ]
    }, function(err) {
      assert.ok(!err)

      server.inject({
        method: 'post',
        url: '/ping'
      }, function(res) {
        assert.equal(res.statusCode, 200)
        assert.equal(res.payload, 'pong')
        done()
      })
    })
  })

  it('POST body propagated to microservice', function (done) {
    hapiPin.attach({
      name: 'test2',
      version: '0.0.1',
      pack: server.pack,
      connectors: [{
          role: 'hello'
        }
      ]
    }, function(err) {
      assert.ok(!err)

      var now = Date.now()

      server.inject({
        method: 'post',
        url: '/hello',
        payload: JSON.stringify({name: 'world ' + now})
      }, function(res) {
        assert.equal(res.statusCode, 200)
        assert.ok(res.headers['content-type'])
        assert.ok(res.headers['content-type'].indexOf('application/json') > -1)
        assert.ok(res.payload)
        var payload = JSON.parse(res.payload)
        assert.ok(payload.result)
        assert.equal(payload.result, 'hello world ' + now)
        done()
      })
    })
  })


})
