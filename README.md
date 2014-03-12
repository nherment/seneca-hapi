
[![Build Status](https://api.travis-ci.org/nherment/seneca-hapi.png?branch=master)](https://travis-ci.org/nherment/seneca-hapi)


```
var Hapi = require('hapi')
var hapiServer = Hapi.createServer('0.0.0.0', 3000)

var seneca = require('seneca')()
seneca.use('hapi')

seneca.ready(function() {

  var hapiPin = seneca.pin({role: 'hapi', cmd:'*'})

  hapiPin.attach({
    name: 'salestax',
    version: '0.0.1',
    pack: hapiServer.pack,
    connectors: [
      {
        'method': 'post',
        'path': '/salestax',
        'role': 'salestax',
        'cmd': 'salestax'
      }
    ], function(err) {

    })

})
```


## attach

### parameters

```name``` (required) the name of the hapi plugin exported

```version``` (required) the version of the hapi plugin exported

```pack``` (required) The server pack to which the plugin should be attached


```connectors``` (required) An array of seneca plugins to expose. Each connector is an object with the following attributes

Connectors have the following attributes:

```method``` (optional) the HTTP method. defaults to ```post```

```path``` (optional) the HTTP path to the endpoint. defaults to ```/<role>```

The path can contain any parameters except ```role```.
For example:
```
role: 'salestax',
path: '/salestax/{cmd}'
```
will expose any command from the 'salestax' microservice.

```role``` (required) the seneca plugin name. The role is required so that you cannot expose all your commands by mistake

```cmd``` (optional) the specific command to expose. By default, all commands are exposed and can be selected with
either the ```cmd``` GET params for GET request or the ```cmd``` attribute in the body payload (json) for other HTTP
methods.


#### Parameters ordering.

It is possible to pass parameters from HTTP to the microservices in multiple ways:

- GET query parameters ```/foo?arg1=abc&arg2=xyz```
- POST body parameters ```{"arg1": "abc", "arg2": "xyz"}```
- routing parameters ```/foo/{arg1}/{arg2} ==> /foo/abc/xyz```

GET parameters are only read when the ```get``` method is specified in the connector.
POST parameters are overridden by routing parameters.

That means that if given the following query:
```
{
  method: 'POST',
  url: '/foo/valueURL1/valueURL2',
  payload: '{"arg1": "valueBody1", "arg2": "valueBody2", "arg3": "valueBody3"}'
}
```

The microservice will receive:
```
{
  arg1: 'valueURL1',
  arg2: 'valueURL2',
  arg3: 'valueBody3'

}
```

If the ```role``` or the ```cmd``` is defined in the connector, the values will take precedence over any parameter
passed to the HTTP endpoint.
