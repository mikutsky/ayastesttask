const _ = require('lodash');
const conf = require('../conf');
const { findFiles, getExportData } = require('../../main/utils');
const ratesService = require('../../main/services/ratesService');
const employeesServices = require('../../main/services/employeesService');

class RatesService {
    constructor() {}

    async exportFromDir() {
        const fileNames = await findFiles(conf.export.dir, conf.export.fileMask);

        for (let idx = 0; idx < fileNames.length; idx++) {
            const data = await getExportData(`${conf.export.dir}/${ fileNames[idx] }`);
            await ratesService.addRates(_.get(data, ['Rates'], []));
            await employeesServices.addEmployees(_.get(data, ['E-List'], []));
        }
    }
}

module.exports = new RatesService();