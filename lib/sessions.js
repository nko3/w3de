var flatiron = require('flatiron')
  , app = flatiron.app;

app.router.get('/session.json', function () {
  var self = this;

  self.res.text("window.Session = {\
    logged: " + (self.req.session.logged === true) + ",\
    username: \"" + self.req.session.username + "\"\
  };");
});

app.router.post('/login', function () {
  var req = this.req, res = this.res;

  if (req.body.username == 'demo' && req.body.password == 'demo') {
    req.session.logged = true;
    req.session.username = req.body.username;
    return res.json({ success: true, session: { logged: true, username: req.body.username } });
  } else {
    return res.json({ success: false });
  }
});

app.router.get('/logout', function () {
  var self = this;

  self.req.session.destroy(function (err) {
    if (err) return self.res.error.json(err, 500);
    self.res.json({ success: true });
  });
});
