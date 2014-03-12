var Hapi = require('hapi')

function HapiPlugin(name, version, seneca) {
  this._seneca = seneca
  this._name = name
  this._version = version
  this._routes = {}
}

HapiPlugin.prototype.addRoute = function(method, path, role, cmd) {

  if(!this._routes[path]) {
    this._routes[path] = {}
  }
  if(!this._routes[path][method]) {
    this._routes[path][method] = {
      role: role,
      cmd: cmd
    }
  }
}

HapiPlugin.prototype._forwardRequestToSeneca = function(request, reply) {

  if(this._routes[request.route.path] && this._routes[request.route.path][request.method]) {

    var senecaCommand = this._routes[request.route.path][request.method]

    var senecaParams


    if(request.method === 'get') {
      senecaParams = request.query || {}
    } else {
      senecaParams = request.payload || {}
    }

    if(request.params) {
      for(var param in request.params) {
        if(request.params.hasOwnProperty(param)) {
          senecaParams[param] = request.params[param]
        }
      }
    }

    senecaParams.role = senecaCommand.role

    if(senecaCommand.cmd) {
      senecaParams.cmd = senecaCommand.cmd
    }

    this._seneca.act(senecaParams, function(err, result) {
      reply( err || result )
    })
  } else {
    // should not happen
    reply(Hapi.error.internal('could not resolve the given route to an existing one'), {
      actual: request.route.path,
      valid: Object.keys(this._routes)
    })
  }
}

HapiPlugin.prototype._register = function(plugin, options, next) {
  var self = this
  function forwardRequestToSeneca(request, reply) {
    self._forwardRequestToSeneca(request, reply)
  }

  for(var path in this._routes) {

    for(var method in this._routes[path]) {

      plugin.route({
        method: method,
        path: path,
        handler: forwardRequestToSeneca
      })

    }

  }

  next()

}

HapiPlugin.prototype.export = function() {
  var self = this
  return {
    name: this._name,
    version: this._version,
    register: function (plugin, options, next) {
      self._register(plugin, options, next)
    }
  }
}


module.exports = HapiPlugin
