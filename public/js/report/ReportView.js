'use strict';

var _ = require('underscore');
var Marionette = require('marionette');
var fs = require('fs');
var layoutTemplate = fs.readFileSync(__dirname + '/report.html', 'utf8');
var moment = require('moment');

var trTable = {
  'd0': 'Понедельник',
  'd1': 'Вторник',
  'd2': 'Среда',
  'd3': 'Четверг',
  'd4': 'Пятница',
  'd5': 'Суббота',
  'd6': 'Воскресенье',

  'total': 'Всего',
  'calls': 'Всего',
  'sales': 'Продажи',
  'service': 'Сервис'
};
// TODO: вообще список групп и их названий нужно получать с бэкэнда, иначе
// теряется смысл конфига, всё равно надо в коде фронтэнда отдельно менять

function translate (word) {
  return trTable[word] || word;
}

var RowView = Marionette.ItemView.extend({
  tagName: 'tr',
  template: _.template('<%=getCols()%>'),
  templateHelpers: {
    getCols: function () {
      var res = [];
      _.each(this, function (val, i) {
        if (+i == i) { // "0", "1", etc
          res = res.concat(['<td>', translate(val), '</td>']);
        }
      });
      return res.join('');
    }
  }
});


var GridView = Marionette.CompositeView.extend({
  template: _.template('<table class="table"><thead><tr><th class="col-xs-2">Период</th><%=getColumns()%></tr></thead><tbody></tbody></table>'),
  childViewContainer: 'tbody',
  childView: RowView,
  serializeData: function () {
    return {
      columns: this.collection.columns,
      rows: this.collection.rows,
      data: this.collection.data
    };
  },
  templateHelpers: {
    getColumns: function () {
      return _.map(this.columns, function (column) {
        return ['<th>', translate(column), '</th>'].join('');
      }).join('');
    }
  }
});

require('bootstrap-datepicker');
require('bootstrap-select');
var tmplFilter = fs.readFileSync(__dirname + '/filter.html', 'utf8');
var FiltersView = Marionette.ItemView.extend({
  template: _.template(tmplFilter),
  templateHelpers: {
    modes: {
      week: 'Неделя',
      day: 'День'
    },
    getValue: function () {
      var startDate = moment(this.from_date);
      var endDate = moment(this.to_date);
      var format = 'DD/MM/YYYY';
      if (startDate.diff(endDate, 'days')) {
        return [startDate.format(format), endDate.format(format)].join(' - ');
      } else {
        return startDate.format(format);
      }
    }
  },

  modelEvents: {
    'change': 'render'
  },

  events: {
    'change .selectpicker': 'onModeChange',
    'change .datepicker': 'onDateChange',
    'hide .datepicker': 'onDateSelected'
  },

  onModeChange: function () {
    var mode = this.$('.selectpicker').val();
    var fromDate = moment(this.from_date);
    var toDate = moment(this.to_date);

    if (mode == 'week') {
      this.model.set({
        mode: mode,
        from_date: fromDate.startOf('week').toISOString(),
        to_date: toDate.endOf('week').toISOString()
      });
    } else {
      this.model.set({
        mode: mode,
        from_date: fromDate.startOf('day').toISOString(),
        to_date: fromDate.endOf('day').toISOString()
      });
    }
  },

  onDateChange: function () {
    var date = this.$('.datepicker').data('datepicker').dates[0];
    if (date) {
      this.setInputDate(date);
    }
  },

  setInputDate: function (date) {
    var mode = this.model.get('mode');

    // dirty hack, using mode for startOf and endOf week/day
    var startDate = this.startDate = moment(date).startOf(mode);
    var endDate = this.endDate = moment(date).endOf(mode);

    if (mode == 'week') {
      var format = 'DD/MM/YYYY';
      this.$('.datepicker').val([startDate.format(format), endDate.format(format)].join(' - '));
    }
  },

  onDateSelected: function () {
    if (this.startDate && this.endDate) {
      var dates = _.map([this.startDate, this.endDate], function (str) {
        return moment(str, 'DD/MM/YYYY').toISOString();
      });
      this.model.set({
        from_date: dates[0],
        to_date: dates[1]
      });
    }
  },

  onRender: function () {
    this.$('.selectpicker').selectpicker();
    this.$('.datepicker').datepicker({
      language: 'ru',
      format: 'dd/mm/yyyy',
      selectWeek: (this.model.get('mode') == 'week')
    });
  }
});

var ReportView = Marionette.LayoutView.extend({
  template: _.template(layoutTemplate),
  className: 'container',
  regions: {
    filters: '.filters',
    grid: '.grid'
  },
  onShow: function () {
    this.filters.show(new FiltersView({
      model: this.collection.filter
    }));
    this.grid.show(new GridView({
      collection: this.collection
    }));
  }
});

module.exports = ReportView;
