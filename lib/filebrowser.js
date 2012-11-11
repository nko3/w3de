var flatiron = require('flatiron')
  , fs = require('fs')
  , path = require('path')
  , app = flatiron.app;

var sendErr = function (res, err) {
  return res.json(500, { success: false, err: err.message });
};

app.router.post('/filebrowser/browse', function () {
  var self = this
    , contents = { dir: [], file: [] };

  if (!self.req.body.path) self.req.body.path = [];

  var fp = path.join(__dirname, '..', 'sandbox', self.req.body.path.join('/'));

  if (!fs.existsSync(fp)) {
    return self.res.json({success: false});
  }

  if (fs.statSync(fp).isFile()) {
    return self.res.json({ success: false });
  }

  fs.readdir(fp, function (err, data) {
    if (err) return sendErr(self.res, err);

    data.forEach(function (e) {
      var stats = fs.statSync(path.join(fp, e));
      if (stats.isFile()) {
        contents.file.push(e);
      } else if (stats.isDirectory()) {
        contents.dir.push(e);
      }
    });

    self.res.json({ success: true, contents: contents });
  });
});
