var flatiron = require('flatiron')
  , path = require('path')
  , fs = require('fs')
  , connect = require('connect')
  , RedisStore = require('connect-redis')(connect);

// Initialize flatiron application
var app = flatiron.app;

// Setup the different configuration stores that are used by the application
app.config.env();
app.config.file({ file: path.join(__dirname, 'config.json') });

var environment = app.config.get('NODE_ENV') || 'development'
  , production = environment === 'production'
  , config = app.config.get(environment)
  , store = new RedisStore(config.redis);

// Set correct configuration
app.config.set('app', config);

// Setup plugins
app.use(flatiron.plugins.log);

app.use(flatiron.plugins.http, {
  buffer: false,
  route: {
    stream: true
  },
  before: [
    connect.cookieParser('iluvrandomstringz'),
    connect.session({ store: store, secret: 'ireallyluvthem' })
  ]
});

app.use(flatiron.plugins.static, {
  index: 'index.html',
  dir: path.join(__dirname, 'public')
});

// The connect-redis module doesn't listen for errors on the redis client so we
// need to handle that our selfs if we don't want our app to crash with silly
// death messages.
store.client.on('error', function redisClient(err) {
  if (err.message.indexOf('ECONNREFUSED')) {
    return app.log.error([
        'Unable to connect to a redis instance'
      , 'make sure that you have a redis server running on ' + config.redis.host + ':' + config.redis.port
    ].join(', '));
  }

  app.log.error('The redis client recieved an error', {
      stack: err.stack
    , message: err.message
  });
});

app.start(9466, function (err) {
  console.log("Server running at http://localhost:9466");
});
