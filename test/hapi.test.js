"use strict";


var seneca = require('seneca')

var assert = require('assert')
var async = require('async')

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

var THROW_ERROR_MESSAGE = 'the microservice crashed'
si.add( {role:'error', cmd: 'throw'}, function(args, callback) {
  throw new Error(THROW_ERROR_MESSAGE)
})

var PROPAGATE_ERROR_MESSAGE = 'the microservice returned an error'
si.add( {role:'error', cmd: 'propagate'}, function(args, callback) {
  callback(new Error(PROPAGATE_ERROR_MESSAGE))
})


var hapiPin = si.pin({role: 'hapi', cmd: '*'})


describe('hapi', function () {

  it('non existing url returns 404', function (done) {
    server.inject({
      method: 'post',
      url: '/ping'
    }, function(res) {
      assert.equal(res.statusCode, 404, 'expected http 404 status code')
      done()
    })
  })

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

  it('method do not spill', function (done) {
    server.inject({
      method: 'get',
      url: '/ping'
    }, function(res) {
      assert.equal(res.statusCode, 404, 'expected http 404 status code')
      done()
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
        assert.equal(payload.result, 'hello world ' + now)
        done()
      })
    })
  })

  it('cmd is passed as param (add)', function (done) {
    hapiPin.attach({
      name: 'test8',
      version: '0.0.1',
      pack: server.pack,
      connectors: [{
        role: 'calculation',
        path: '/calculation'
      }]
    }, function(err) {
      assert.ok(!err)
      async.parallel([
        function(callback) {
          server.inject({
            method: 'post',
            url: '/calculation',
            payload: JSON.stringify({operands: [3, 4, 7], cmd: 'add'})
          }, function(res) {
            assert.equal(res.statusCode, 200, 'expected http 200 status code')
            assert.ok(res.headers['content-type'], 'missing content-type headers')
            assert.ok(res.headers['content-type'].indexOf('application/json') > -1, 'missing application/json content-type headers')
            assert.ok(res.payload, 'missing response body')
            var payload = JSON.parse(res.payload)
            assert.equal(payload.result, 14, 'wrong calculus result')
            callback()
          })
        },
        function(callback) {
          server.inject({
            method: 'post',
            url: '/calculation',
            payload: JSON.stringify({operands: [3, 4, 7], cmd: 'multiply'})
          }, function(res) {
            assert.equal(res.statusCode, 200, 'expected http 200 status code')
            assert.ok(res.headers['content-type'], 'missing content-type headers')
            assert.ok(res.headers['content-type'].indexOf('application/json') > -1, 'missing application/json content-type headers')
            assert.ok(res.payload, 'missing response body')
            var payload = JSON.parse(res.payload)
            assert.equal(payload.result, 84, 'wrong calculus result')
            callback()
          })
        }
      ], done);


    })
  })

  it('cmd can be configured on the route', function (done) {
    hapiPin.attach({
      name: 'test9',
      version: '0.0.1',
      pack: server.pack,
      connectors: [{
        role: 'calculation',
        cmd: 'multiply',
        path: '/calculation/multiply'
      }]
    }, function(err) {
      assert.ok(!err)

      server.inject({
        method: 'post',
        url: '/calculation/multiply',
        payload: JSON.stringify({operands: [3, 4, 7], cmd: 'foobar'})
      }, function(res) {
        assert.equal(res.statusCode, 200, 'expected http 200 status code')
        assert.ok(res.headers['content-type'], 'missing content-type headers')
        assert.ok(res.headers['content-type'].indexOf('application/json') > -1, 'missing application/json content-type headers')
        assert.ok(res.payload, 'missing response body')
        var payload = JSON.parse(res.payload)
        assert.equal(payload.result, 84, 'wrong calculus result')
        done()
      })

    })
  })

  it('an error is obfuscated when the microservice crashes', function (done) {
    hapiPin.attach({
      name: 'test10',
      version: '0.0.1',
      pack: server.pack,
      connectors: [{
        role: 'error',
        cmd: 'throw',
        path: '/error/throw',
        method: 'get'
      }]
    }, function(err) {
      assert.ok(!err)

      server.inject({
        method: 'get',
        url: '/error/throw'
      }, function(res) {
        assert.equal(res.statusCode, 500, 'expected http 500 status code')
        assert.ok(res.headers['content-type'], 'missing content-type headers')
        assert.ok(res.headers['content-type'].indexOf('application/json') > -1, 'missing application/json content-type headers')
        assert.ok(res.payload, 'missing response body')
        var payload = JSON.parse(res.payload)
        assert.equal(payload.message, 'An internal server error occurred')
        done()
      })

    })
  })

  it('an error is propagated when the microservice returns an error', function (done) {
    hapiPin.attach({
      name: 'test11',
      version: '0.0.1',
      pack: server.pack,
      connectors: [{
        role: 'error',
        cmd: 'propagate',
        path: '/error/propagate',
        method: 'get'
      }]
    }, function(err) {
      assert.ok(!err)

      server.inject({
        method: 'get',
        url: '/error/propagate'
      }, function(res) {
        assert.equal(res.statusCode, 500, 'expected http 500 status code')
        assert.ok(res.headers['content-type'], 'missing content-type headers')
        assert.ok(res.headers['content-type'].indexOf('application/json') > -1, 'missing application/json content-type headers')
        assert.ok(res.payload, 'missing response body')
        var payload = JSON.parse(res.payload)
        assert.ok(payload.message)
        assert.ok(payload.message.indexOf(PROPAGATE_ERROR_MESSAGE) > -1)
        done()
      })

    })
  })

  it('the error is human readable if we address a non existing command', function (done) {
    hapiPin.attach({
      name: 'test12',
      version: '0.0.1',
      pack: server.pack,
      connectors: [{
        role: 'error',
        cmd: 'doesNotExist',
        path: '/test12',
        method: 'get'
      }]
    }, function(err) {
      assert.ok(!err)

      server.inject({
        method: 'get',
        url: '/test12'
      }, function(res) {
        assert.equal(res.statusCode, 500, 'expected http 500 status code')
        assert.ok(res.headers['content-type'], 'missing content-type headers')
        assert.ok(res.headers['content-type'].indexOf('application/json') > -1, 'missing application/json content-type headers')
        assert.ok(res.payload, 'missing response body')
        var payload = JSON.parse(res.payload)
        assert.ok(payload.message)
        assert.ok(payload.message.indexOf('action not found for args') > -1)
        done()
      })

    })
  })

})
