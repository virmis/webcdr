var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var Marionette = require('backbone.marionette');

require('./plugins');

var app = window.app = new Marionette.Application();

var NavbarView = require('./views/NavbarView');

require('./cdr');
require('./report');
require('./admin');

var ModalRegion = Marionette.Region.extend({
  el: '#modal',

  onShow: function (view) {
    this.$el.find('.modal').modal();
  },

  hide: function () {
    this.$el.find('.modal').modal('hide');
  }
});

var RootView = Marionette.LayoutView.extend({
  el: 'body',

  regions: {
    navigation: '#navigation',
    main: '#main',
    modal: ModalRegion
  }
});

app.rootView = new RootView();

app.on('start', function (options) {
  app.navcol = new Backbone.Collection([{
    name: 'Звонки',
    icon: 'fa-bars',
    target: 'cdr',
    active: true
  }, {
    name: 'Отчёты',
    icon: 'fa-bar-chart',
    target: 'report'
  }]);

  app.navbar = new NavbarView({
    collection: app.navcol
  });
  app.rootView.navigation.show(app.navbar);

  var Profile = Backbone.Model.extend({
    url: '/profile'
  });

  app.profile = new Profile();
  app.profile.fetch().then(function () {
    if (app.profile.get('admin')) {
      app.navcol.push({
        name: 'Администрирование',
        icon: 'fa-users',
        target: 'admin'
      });
    }
  });

  var controller = {
    'changeTab': function (tab) {
      app.navbar.setActive(tab);
      switch (tab) {
        case 'cdr':
          app.showCDR();
          break;
        case 'report':
          app.showReport();
          break;
        case 'admin':
          app.showAdmin();
          break;
      }
    }
  };

  app.router = new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      ':tab': 'changeTab'
    }
  });

  this.listenTo(app.navbar, 'navigate', function (target) {
    app.router.navigate(target);
    controller.changeTab(target);
  });

  if (Backbone.history) {
    Backbone.history.start();
  }

  if (Backbone.history.fragment === '') {
    app.router.navigate('cdr', { trigger: true });
  }
});

app.start();
