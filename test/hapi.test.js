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
        assert.equal(res.statusCode, 200, 'expected http 200 status code')
        assert.equal(res.payload, 'pong', 'microservice did not answered to ping')
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
        assert.equal(res.statusCode, 200, 'expected http 200 status code')
        assert.ok(res.headers['content-type'], 'missing content-type headers')
        assert.ok(res.headers['content-type'].indexOf('application/json') > -1, 'missing application/json content-type headers')
        assert.ok(res.payload, 'missing response body')
        var payload = JSON.parse(res.payload)
        assert.ok(payload.result, 'missing result')
        assert.equal(payload.result, 'hello world ' + now)
        done()
      })
    })
  })

  it('custom url', function (done) {
    hapiPin.attach({
      name: 'test3',
      version: '0.0.1',
      pack: server.pack,
      connectors: [{
          role: 'ping',
          path: '/pingpong'
        }
      ]
    }, function(err) {
      assert.ok(!err)

      var now = Date.now()

      server.inject({
        method: 'post',
        url: '/pingpong'
      }, function(res) {
        assert.equal(res.statusCode, 200, 'expected http 200 status code')
        assert.equal(res.payload, 'pong', 'microservice did not answered to ping')
        done()
      })
    })
  })

  it('get http method', function (done) {
    hapiPin.attach({
      name: 'test4',
      version: '0.0.1',
      pack: server.pack,
      connectors: [{
          role: 'ping',
          path: '/pingpong2',
          method: 'get'
        }
      ]
    }, function(err) {
      assert.ok(!err)

      var now = Date.now()

      server.inject({
        method: 'get',
        url: '/pingpong2'
      }, function(res) {
        assert.equal(res.statusCode, 200, 'expected http 200 status code')
        assert.equal(res.payload, 'pong', 'microservice did not answered to ping')
        done()
      })
    })
  })

  it('put http method', function (done) {
    hapiPin.attach({
      name: 'test5',
      version: '0.0.1',
      pack: server.pack,
      connectors: [{
          role: 'hello',
          path: '/helloPut',
          method: 'put'
        }
      ]
    }, function(err) {
      assert.ok(!err)

      var now = Date.now()

      server.inject({
        method: 'put',
        url: '/helloPut',
        payload: JSON.stringify({name: 'world ' + now})
      }, function(res) {
        assert.equal(res.statusCode, 200, 'expected http 200 status code')
        assert.ok(res.headers['content-type'], 'missing content-type headers')
        assert.ok(res.headers['content-type'].indexOf('application/json') > -1, 'missing application/json content-type headers')
        assert.ok(res.payload, 'missing response body')
        var payload = JSON.parse(res.payload)
        assert.ok(payload.result, 'missing result')
        assert.equal(payload.result, 'hello world ' + now)
        done()
      })
    })
  })

  it('delete http method', function (done) {
    hapiPin.attach({
      name: 'test6',
      version: '0.0.1',
      pack: server.pack,
      connectors: [{
          role: 'hello',
          path: '/helloDelete',
          method: 'delete'
        }
      ]
    }, function(err) {
      assert.ok(!err)

      var now = Date.now()

      server.inject({
        method: 'delete',
        url: '/helloDelete',
        payload: JSON.stringify({name: 'world ' + now})
      }, function(res) {
        assert.equal(res.statusCode, 200, 'expected http 200 status code')
        assert.ok(res.headers['content-type'], 'missing content-type headers')
        assert.ok(res.headers['content-type'].indexOf('application/json') > -1, 'missing application/json content-type headers')
        assert.ok(res.payload, 'missing response body')
        var payload = JSON.parse(res.payload)
        assert.ok(payload.result, 'missing result')
        assert.equal(payload.result, 'hello world ' + now)
        done()
      })
    })
  })

  it('get http method pass arguments from query', function (done) {
    hapiPin.attach({
      name: 'test7',
      version: '0.0.1',
      pack: server.pack,
      connectors: [{
          role: 'hello',
          path: '/helloGet',
          method: 'get'
        }
      ]
    }, function(err) {
      assert.ok(!err)

      var now = Date.now()

      server.inject({
        method: 'get',
        url: '/helloGet?name=world ' + now
      }, function(res) {
        assert.equal(res.statusCode, 200, 'expected http 200 status code')
        assert.ok(res.headers['content-type'], 'missing content-type headers')
        assert.ok(res.headers['content-type'].indexOf('application/json') > -1, 'missing application/json content-type headers')
        assert.ok(res.payload, 'missing response body')
        var payload = JSON.parse(res.payload)
        assert.ok(payload.result, 'missing result')
        assert.equal(payload.result, 'hello world ' + now)
        done()
      })
    })
  })


})
