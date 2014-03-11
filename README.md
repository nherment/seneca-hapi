
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

#### name
the name of the hapi plugin exported

#### version
the version of the hapi plugin exported

#### pack
The server pack to which the plugin should be attached

#### connectors

An array of seneca plugins to expose. Each connector is an object with the following attributes

##### method

the HTTP method

- optional. defaults to 'post'

#### path
the HTTP path to the endpoint

- optional. defaults to /<role>

#### role

the seneca plugin name

- required

#### cmd

the specific command to expose

- optional. By default, all commands are exposed and can be selected with either the ```cmd``` GET params for GET
request or the ```cmd``` attribute in the body payload (json) for other HTTP methods.
