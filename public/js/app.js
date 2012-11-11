;(function ($, window, undefined) {
  'use strict';

  var $doc = $(document),
      Modernizr = window.Modernizr;

  $(document).ready(function() {
    $.fn.foundationAlerts           ? $doc.foundationAlerts() : null;
    $.fn.foundationButtons          ? $doc.foundationButtons() : null;
    $.fn.foundationAccordion        ? $doc.foundationAccordion() : null;
    $.fn.foundationNavigation       ? $doc.foundationNavigation() : null;
    $.fn.foundationTopBar           ? $doc.foundationTopBar() : null;
    $.fn.foundationCustomForms      ? $doc.foundationCustomForms() : null;
    $.fn.foundationMediaQueryViewer ? $doc.foundationMediaQueryViewer() : null;
    $.fn.foundationTabs             ? $doc.foundationTabs({callback : $.foundation.customForms.appendCustomMarkup}) : null;
    $.fn.foundationTooltips         ? $doc.foundationTooltips() : null;
    $.fn.foundationMagellan         ? $doc.foundationMagellan() : null;
    $.fn.foundationClearing         ? $doc.foundationClearing() : null;

    $.fn.placeholder                ? $('input, textarea').placeholder() : null;

    initiateMenu();
    initiateLoginManager();
    initiateTerminal();
    initiateFilebrowser();
  });

  // UNCOMMENT THE LINE YOU WANT BELOW IF YOU WANT IE8 SUPPORT AND ARE USING .block-grids
  // $('.block-grid.two-up>li:nth-child(2n+1)').css({clear: 'both'});
  // $('.block-grid.three-up>li:nth-child(3n+1)').css({clear: 'both'});
  // $('.block-grid.four-up>li:nth-child(4n+1)').css({clear: 'both'});
  // $('.block-grid.five-up>li:nth-child(5n+1)').css({clear: 'both'});

  // Hide address bar on mobile devices (except if #hash present, so we don't mess up deep linking).
  if (Modernizr.touch && !window.location.hash) {
    $(window).load(function () {
      setTimeout(function () {
        window.scrollTo(0, 1);
      }, 0);
    });
  }

  key.originalFilter = key.filter;

  var toggleKeymasterFilter = function () {
    if (key.filter === key.originalFilter) {
      key.filter = function (event) {
        return true;
      }
    } else {
      key.filter = key.originalFilter;
    }
  }

  var initiateTerminal = function () {
    if (window.location.pathname != '/terminal') return;

    if (window.Session && window.Session.logged) {
      ui.notify('Help', 'Press CTRL + H for help').effect('slide').sticky();
    } else {
      window.location.href = '/';
    }
  }

  var initiateFilebrowser = function () {
    if (window.location.pathname != '/filebrowser') return;

    if (window.Session && window.Session.logged) {
      var rid = 0, cid = 0;

      var loadFiles = function (path) {
        $.ajax({
          type: "POST",
          url: "/filebrowser/browse",
          data: { path: path },
          dataType: 'json',
          success: function (data) {
            if (data.success) {
              var rid = -1, cid = 6, rows = [];

              data.contents.dir.forEach(function (e) {
                if (cid == 6) {
                  rows.push([]); rid += 1; cid = 0;
                }
                rows[rid].push({ cid: cid, name: e, type: 'folder' });
                cid += 1;
              });

              data.contents.file.forEach(function (e) {
                if (cid == 6) {
                  rows.push([]); rid += 1; cid = 0;
                }
                rows[rid].push({ cid: cid, name: e, type: 'file'});
                cid += 1;
              });

              var html = '';

              rows.forEach(function (e,i) {
                html+= '<div class="row" id="r'+i+'">';
                e.forEach(function (c) {
                  html+= '<div class="two columns" id="c'+c.cid+'">';
                  html+= '<a href="#'+c.name+'" class="lsf">' + c.type;
                  html+= '</a><br><span>' + c.name + '</div>';
                });

                for(var i=0; i<6-e.length; i++) {
                  html+= '<div class="two columns"></div>';
                }
                html+= '</div>';
              });

              cid = 0; rid = 0;
              $('#fileview').html(html);
            } else {
              ui.warn('Error', 'Something went wrong').effect('slide');
            }
          },
          error: function () {
            ui.error('Error', 'Something went wrong').effect('slide');
          }
        });

        return false;
      };

      ui.notify('Help', 'Press CTLR + H for help').effect('slide').sticky();

      var remembers = [], ri = -1, cp = [];

      key('ctrl+h', 'filebrowser', function () {
        $('#help-filebrowser').reveal();
        return false;
      });

      key('ctrl+d', 'filebrowser', function () {
        window.location.href = '/';
        return false;
      });

      key('ctrl+left', 'filebrowser', function () {
        if (ri < 0) return false;
        ri -= 1;
        cp = JSON.parse(JSON.stringify((remembers[ri])));
        return loadFiles(cp);
      });

      key('ctrl+right', 'filebrowser', function () {
        if (ri == remembers.length-1) return false;
        ri += 1;
        cp = JSON.parse(JSON.stringify((remembers[ri])));
        return loadFiles(cp)
      });

      key('ctrl+up', 'filebrowser', function () {
        cp.pop(); ri += 1;
        remembers.push(JSON.parse(JSON.stringify(cp)));
        return loadFiles(cp);
      });

      key('ctrl+r', 'filebrowser', function () {
        return loadFiles(cp);
      })

      key('up', function () {
        $('#r'+rid+' #c'+cid).removeClass('active');
        rid -= 1;
        $('#r'+rid+' #c'+cid).addClass('active');
      })

      key('down', function () {
        $('#r'+rid+' #c'+cid).removeClass('active');
        rid += 1;
        $('#r'+rid+' #c'+cid).addClass('active');
      })

      key('left', function () {
        $('#r'+rid+' #c'+cid).removeClass('active');
        cid -= 1;
        $('#r'+rid+' #c'+cid).addClass('active');
      })

      key('right', function () {
        $('#r'+rid+' #c'+cid).removeClass('active');
        cid += 1;
        $('#r'+rid+' #c'+cid).addClass('active');
      })

      key('enter', function () {
        var name = $('#r'+rid+' #c'+cid+' a')[0].href;
        name = name.substr(name.indexOf('#')+1);
        cp.push(name); ri += 1;
        remembers.push(JSON.parse(JSON.stringify(cp)));
        loadFiles(cp);
      })

      key.setScope('filebrowser');

      loadFiles(['']);

      $('body').removeClass('loader');
    } else {
      window.location.href = '/';
    }
  }

  var initiateLoginManager = function () {
    if (window.location.pathname != '/') return;

    if (window.Session && window.Session.logged) {
      initiateDesktop();
    } else {
      key('enter', 'login', function () {
        var inputs = $('#login input')
          , username = inputs[0].value
          , password = inputs[1].value;

        $('#login form').hide();
        $('#login .loader').show();

        var loginFailed = function () {
          $('#login .loader').hide();
          $('#login form').show();
          return ui.error('Error', 'Login failed').effect('slide');
        }

        $.ajax({
          type: "POST",
          url: "/login",
          data: { username: username, password: password },
          dataType: 'json',
          success: function (data) {
            if (!data.success) {
              return loginFailed();
            }

            window.Session = data.session;

            $('body').addClass('loader');

            toggleKeymasterFilter();
            initiateDesktop();
            $('#login').trigger('reveal:close');

            ui.success('Success', 'Logged in').effect('slide');
          },
          error: function () {
            return loginFailed();
          }
        });
      });

      key.setScope('login');
      toggleKeymasterFilter();

      $('#login').reveal({
        closeOnBackgroundClick: false,
        closeOnEscapeReleased: false
      });

      $('body').removeClass('loader');
    }
  };

  var setDesktopKeymaster = function () {
    var r = 1, c = 1, rMax = 1, cMax = 2;

    var removeActive = function () {
      $('#r' + r + ' #c' + c).removeClass('active');
    };

    var addActive = function () {
      while (r <= 0) r+=rMax;
      while (r > rMax) r-=rMax;
      while (c <= 0) c+=cMax;
      while (c > cMax) c-=cMax;
      $('#r' + r + ' #c' + c).addClass('active');
    };

    key('enter', 'desktop', function () {
      $('#r' + r + ' #c' + c + ' a')[0].click();
      return false;
    });

    key('down', 'desktop', function () {
      removeActive();
      r += 1;
      addActive();
      return false;
    });

    key('up', 'desktop', function () {
      removeActive();
      r -= 1;
      addActive();
      return false;
    });

    key('right', 'desktop', function () {
      removeActive();
      c += 1;
      addActive();
      return false;
    });

    key('left', 'desktop', function () {
      removeActive();
      c -= 1;
      addActive();
      return false;
    });

    key('ctrl+h', 'desktop', function () {
      $('#help-desktop').reveal();
      return false;
    });

    key('ctrl+d', 'desktop', function () {
      $.ajax({
        type: "GET",
        url: "/logout",
        dataType: 'json',
        success: function (data) {
          if (data.success) return window.location.href = '/';
          ui.error('Error', 'Logout failed').effect('slide');
        },
        error: function () {
          ui.error('Error', 'Logout failed').effect('slide');
        }
      });

      return false;
    });

    key.setScope('desktop');
  };

  var initiateDesktop = function () {
    setDesktopKeymaster();
    $('body').removeClass('loader');
    $('body').addClass('desktop');
    $('#desktop').show();

    ui.notify('Help', 'Press CTRL + H for help').effect('slide').sticky();
  };

  var initiateMenu = function () {
    window.Menu = ui.menu();

    window.oncontextmenu = function (e) {
      e.preventDefault();
      window.Menu.moveTo(e.pageX, e.pageY).show();
    };
  }

})(jQuery, this);
