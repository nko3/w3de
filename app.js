var flatiron = require('flatiron'),
    path = require('path'),
    app = flatiron.app;

app.config.file({ file: path.join(__dirname, 'config.json') });

app.use(flatiron.plugins.http);
app.use(flatiron.plugins.static, { dir: path.join(__dirname, 'public') });

app.router.get('/', function () {
  this.res.json({ 'hello': 'world' })
});

app.start(9466, function (err) {
  console.log("Server running at http://localhost:9466");
});
