+(function(module, require, moment, React, ReactIntl, $, undefined, window){
'use strict';

var IntlMixin       = ReactIntl.IntlMixin;
var FormattedNumber = ReactIntl.FormattedNumber;
var L = ReactIntl.FormattedMessage;
var groupBy = require('./groupBy.react');
var actions = require('./actions.react');
var Alerts = require('./alerts.react');
var GroupByFilter = require('./groupByFilter.react');
var ExpenseGroup = require('./expenseGroup.react');
var NewExpense = require('./newExpense.react');
var api = require('./api.react');
var AppDispatcher = require('./dispatcher.react');

var Expenses = React.createClass({
  mixins: [IntlMixin],
  getInitialState: function() {
    return {
      groupBy: groupBy.All,
      newExpense: {},
      expenses: [],
      items: {'all': []},
      groups: ['all'],
      format: '',
      loading: true,
    };
  },

  componentDidMount: function() {

    var _ = this;
  
    AppDispatcher.register(function(action){

      switch(action.actionType)
      {
        case actions.expensesUpdated:
          _.setState(action.data);
        break;
        case actions.groupChanged:
          _.setState(action.data);
        break;
        case actions.expensesLoaded:
          _.dateLoaded(action.data);
        break;
        case actions.expenseInserted:
          _.addNewExpense(action.data);
        break;
            case actions.expenseDeleted:
          _.onDelete(action.data);
        break;
      }
    });
    
    api.expenses.get();
  },
  onDelete: function(expense) {
    var _ = this;
    var state = _.state;
    
    var deleted = state.expenses.filter(function(item){
      return item.id === expense.id;
    }).pop();
    
    var index = state.expenses.indexOf(deleted);
    
    if(index > -1 ) {
      state.expenses.splice(index, 1);
      
      _.update(state.expenses);
    }
  },
  //componentWillUnmount: function() { },
  dateLoaded: function(list){
    var state = this.state;
    var _ = this;
    var expenses = state.expenses = state.expenses || [];
    expenses.length && expenses.splice(0, expenses.length);
    
    list.forEach(function(item){
      expenses.push({
        id: item.id,
        description: item.description,
        date: item.date.substring(0, 10),
        time: item.time && item.time.length > 5 ? item.time.substring(0, 5) : item.time,
        amount: item.amount,
        comment: item.comment,
        user_id: item.user_id
      })
    });

    _.update(expenses);
  },
  update: function(expenses, groupBy) {
    var state = this.state;
    var _ = this;
    expenses = _.sort(expenses);
    var grouped = _.groupDictionary(expenses, groupBy);

    //AppDispatcher.dispatch({actionType: actions.expensesUpdated, data: {expenses: expenses, items: grouped.items, groups: grouped.groups}});
    _.setState(grouped);
    _.setState({loading: false});
  },
  // simulateChange: function(ev){
    // React.addons.TestUtils.simulateNativeEventOnNode('topInput', ev.target, {type:'input', target: ev.target});
    // ev.stopImmediatePropagation();      
  // },
  sort: function(expenses){
    var state = this.state;

    expenses.sort(function(a, b) {
      if(a.date > b.date){
        return 1;
      }
      if(a.date < b.date){
        return -1;
      }
      if(a.time > b.time){
        return 1;
      }
      if(a.time < b.time){
        return -1;
      }
      return 0;
    });
    return expenses;
  },
  addNewExpense: function(add){
    var _ = this;
    var state = _.state;

    state.expenses.push(add);

    _.update(state.expenses);
  },
  changeGroupHandler: function(groupBy){
    this.setState({groupBy: groupBy});
    
    this.update(this.state.expenses, groupBy);
  },
  groupFormat: function(groupByLabel){
    var groupFormat = null;
    switch(groupByLabel){
      case groupBy.Week:
        groupFormat = 'YYYY-[W]ww';
        break;
      case groupBy.Month:
        groupFormat = 'YYYY-MM';
        break;
      case groupBy.Year:
        groupFormat = 'YYYY';
        break;
    }
    return groupFormat;
  },
  groupDictionary: function(expenses, groupBy) {
    var _ = this;
    var state = _.state;
    var groupDictionary, groups = [], groupFormat = _.groupFormat(groupBy || state.groupBy);

    if(groupFormat) {
      groupDictionary = {};
      expenses.forEach(function(item) {
        var key = moment(item.date).format(groupFormat);
        var groupExists = key in groupDictionary;
        groupDictionary[key] = groupDictionary[key] || [];
        groupDictionary[key].push(item);
        !groupExists && groups.push(key);
      });
    }
    return groupDictionary ? {items: groupDictionary, groups: groups, format: groupFormat} : {items: {'all': state.expenses}, groups: ['all'], format: ''};
  },
  l10n: function(messageName){
    return this.getIntlMessage(messageName);
  },
  render: function() {
    var _ = this;
    var cx = React.addons.classSet;
    var state = _.state;
    var len = state.expenses && state.expenses.length || 0;
    var maxDate = len && state.expenses[0].date;
    var minDate = len && state.expenses[len - 1].date;
    var sum = state.expenses.reduce(function(previousValue, currentValue, index, array) {
      return previousValue + (Number(array[index].amount) || 0);
    }, 0);
    var duration = (len && moment(maxDate).twix(minDate)) || (len && 1) || 0;
    var days = (duration && duration.length('days')) || (len && 1) || 0;
    var dayAvg = days && sum/days || 0;
    var weeks = (duration && duration.length('weeks')) || (len && 1) || 0;
    var weekAvg = weeks && sum/weeks || dayAvg;
    var months = (duration && duration.length('months')) || (len && 1) || 0;
    var monthAvg = months && sum/months || weekAvg || dayAvg;
    var years = duration && duration.length('years') || 0;
    var yearAvg = months && sum/years || yearAvg || monthAvg || dayAvg;
    var groups  = state.groups;
    var items  = state.items;
    var width100P = {width: '100%'};

    return (
      <div className="expenses-list panel panel-default">
        <div className="panel-heading"><h2><L message={_.l10n('Expenses')}/></h2></div>
        <div className={cx({'panel-body':true, 'hidden-print':true, 'hide-element': !state.loading})}>
          <div className="progress">
            <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style={width100P}>
            </div>
          </div>
        </div>
        <div className={cx({'panel-body':true, 'hidden-print':true, 'hide-element': state.loading})}>
          <GroupByFilter groupBy={state.groupBy} onGroupChanged={_.changeGroupHandler} />
          <Alerts />
        </div>
        <table className={cx({'table':true, 'table-hover':true, 'table-condensed': true, 'hide-element': state.loading})}>
          <thead>
            <tr>
              <th></th><th><L message={_.l10n('Date')}/></th><th>Time</th><th>Description</th><th>Amount</th><th>Comment</th>
            </tr>
          </thead>
          <tfoot>
          <tr className="info total">
            <td>Total:</td>
            <td colSpan="5"><L message={_.l10n('Total')} length={len} sum={sum} dayAvg={dayAvg} weekAvg={weekAvg} monthAvg={monthAvg} yearAvg={yearAvg} /></td>
          </tr>
          </tfoot>
          <NewExpense />
          {state.groups.map(function(name, i) {
            return <ExpenseGroup key={state.groupBy + name + i} index={i} groupBy={state.groupBy} name={name} expenses={_.state.items[name]} format={state.format} />;
            })}
        </table>
      </div>
    );
  }
});

module.exports = Expenses;

})(module, require, moment, React, ReactIntl, jQuery, undefined, window);