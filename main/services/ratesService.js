const _ = require('lodash');
const { getMD5 } = require('../utils/index');
const dataBase = require('../db');

let db = null;

class RatesService {
    constructor() {
        db = dataBase.db;
    }

    async addCurrencies(signs = []) {
        const uniqSigns = _.uniq(signs);
        const currencies = _.map(uniqSigns, sign => ({ sign }));

        if (!_.isEmpty(currencies)) {
            await db('currencies').insert(currencies)
                .onConflict('sign')
                .ignore()
                .returning('*');
        }

        return await this.getCurrencies();
    }

    async getCurrencies() {
        return db('currencies').select(['id', 'sign']);
    }

    async addRates(rates = []) {
        const signs = _.map(rates, 'sign');
        const currencies = await this.addCurrencies(signs);

        const _rates = _.map(rates, (rate) => {
            const currency = _.find(currencies, currency => currency.sign === rate.sign);
            const currencyId = _.get(currency, ['id'], null);
            const _rate = _.cloneDeep(rate);
            _.set(_rate, ['currency_id'], currencyId);
            _.set(_rate, ['hash'], getMD5(_.pick(_rate, ['date', 'currency_id'])));

            return _.pick(_rate, ['hash', 'date', 'value', 'currency_id']);
        });

        const uniqRates = _.uniqBy(_rates, 'hash');

        return _.isEmpty(uniqRates) ? []
            : db('rates').insert(uniqRates)
                .onConflict('hash')
                .merge(['value']);
    }
}

module.exports = new RatesService();