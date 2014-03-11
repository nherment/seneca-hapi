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


var hapiPin = si.pin({role: 'hapi', cmd: '*'})


describe('salestax', function () {

  it('only required arguments', function (done) {
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
        assert.equal(res.payload, 'pong')
        done()
      })
    })
  })


})
