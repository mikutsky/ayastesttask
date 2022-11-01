const _ = require('lodash');

const conf = require('./main/conf');
const db = require('./main/db');

const { findFiles, getExportData } = require('./main/utils');

const express = require('express');
const router = require('./main/router');

const ratesService = require('./main/services/ratesServices');
const employeesServices = require('./main/services/employeesServices');

const app = express();
app.use(express.json());
app.use(router);

const init = async () => {
    try {
        await db.init();

        const fileNames = await findFiles(conf.export.dir, conf.export.fileMask);

        await Promise.all(_.map(fileNames, async fileName => {
            const data = await getExportData(`${conf.export.dir}/${fileName}`);
            await ratesService.addRates(_.get(data, ['Rates'], []));
            await employeesServices.addEmployees(_.get(data, ['E-List'], []));
        }));

        
    } catch (e) {
        console.error(e);
    }

    app.listen(conf.port, () => {
        console.log(`Server running on port: ${conf.port}`);
    });
}

setImmediate(init);
