var flatiron = require('flatiron')
  , app = flatiron.app;

module.exports = function (req, res) {
  /**
   * Redirect the user.
   */
  res.redirect = function redirect() {
    var args = arguments
      , location
      , code;

    switch(args.length) {
      case 1:
        location = args[0];
        code = 302;
        break;

      case 2:
        location = +args[0] ? args[1] : args[0];
        code = +args[0] ? +args[0] : args[1];
        break;

      default:
        location = '/';
        code = 302;
    }

   res.writeHead(code || 302, { 'Location': location });
    if (!req.session) return res.end();

    req.session.resetMaxAge();
    req.session.save(function save() {
      res.end();
    });
  };

  // the originalURL is required as union does not work with the latest
  // connect version.
  req.originalUrl = req.originalUrl || req.url;
  res.emit('next');
};
