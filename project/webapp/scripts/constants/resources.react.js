'use strict';

//import React     from 'react';
//import ReactIntl from 'react-intl';

const defaultLang = 'en';
let lang = defaultLang;//navigator.language || navigator.browserLanguage;

let locales = [{
    lang: 'en',
    locales: 'en-US',
    formats: {
        number: {
            USD: {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        }
    },
    messages: {
        Date: 'Date',
        LoginFormTitle: 'Please sign in or register',
        Expenses: 'Expenses',
        Total: '{length, plural, one{# expense} other{# expenses}}, Sum:{sum, number, USD}, AVG: {avg, number, USD}, AVG by day:{dayAvg, number, USD}({days}), by week:{weekAvg, number, USD}({weeks}), by month:{monthAvg, number, USD}({months}), by year:{yearAvg, number, USD}({years})',
        expenseDeleted: 'Expense deleted',
        expensesLoaded: 'Expenses data loaded',
        expenseInserted: 'Expense inserted'
    }
},
{
    lang: 'ru',
    locales: 'ru-RU',
    formats: {
        number: {
            USD: {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        }
    },
    messages: {
        Date: 'Дата',
        LoginFormTitle: 'Войдите или зарегистрируйтесь',
        Expenses: 'Расходы',
        Total: '{length, plural, one{# запись} other{# записи}}, Сумма:{sum, number, USD}, Среднее за день:{dayAvg, number, USD}, в неделю:{weekAvg, number, USD}, в месяц:{monthAvg, number, USD}, в год:{yearAvg, number, USD}'
    }
}];

let filter = item => item.lang === lang;
let isSupported = locales.filter(filter).length;

lang = isSupported ? lang : defaultLang;

let data = locales.filter(filter).shift();

export default data
