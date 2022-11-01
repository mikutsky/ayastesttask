const _ = require('lodash');
const { getMD5 } = require('../utils/index');
const { init } = require('../db');

class RatesServices {
    constructor() {}

    async addCurrencies(signs = []) {
        const db = await init(); //todo: db
        const uniqSigns = _.uniq(signs);
        const currencies = _.map(uniqSigns, sign => ({ sign }));

        const result = await db('currencies').insert(currencies)
            .onConflict('sign')
            .ignore()
            .returning('*');

        return result.length < currencies.length ? await this.getCurrencies() : result;
    }

    async getCurrencies() {
        const db = await init(); //todo: db

        return db('currencies').select('*');
    }

    async addRates(rates = []) {
        const db = await init(); //todo: db
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

        return db('rates').insert(_.uniqBy(_rates, 'hash'))
            .onConflict('hash')
            .merge(['value']);
    }
}

module.exports = new RatesServices();