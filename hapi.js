"use strict";

var HapiPlugin  = require('./lib/HapiPlugin.js')

function hapi(options) {
  var seneca = this
  var plugin = 'hapi'

  var hapiPlugins = {}

  seneca.add( {role: plugin, cmd: 'attach'}, function(args, callback) {

    if( !args.pack ) { return seneca.fail({code:'pack arg required', args: args}, callback) }
    if( !args.name ) { return seneca.fail({code:'name arg required', args: args}, callback) }
    if( !args.version ) { return seneca.fail({code:'version arg required', args: args}, callback) }
    if( !args.connectors || !args.connectors.length ) {
      return seneca.fail({code:'connectors arg required', args: args}, callback)
    }

    var hapiPlugin = new HapiPlugin(args.name, args.version, seneca)

    for(var i = 0 ; i < args.connectors.length ; i++) {
      var connector = args.connectors[i]

      if( !connector.role ) { return seneca.fail({code:'connector role is required', args: args}, callback) }

      hapiPlugin.addRoute(
        connector.method || 'post',
        connector.path || '/' + connector.role,
        connector.role,
        connector.cmd
      )
    }

    args.pack.register(hapiPlugin.export(), {}, function(err) {
      callback(err, undefined)
    })
  })

  return {
    name: plugin
  }

}


module.exports = hapi
