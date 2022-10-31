const _ = require('lodash');

const conf = require('./main/conf');
const db = require('./main/db');

const { findFiles, getExportData } = require('./main/utils');

const express = require('express');
const router = require('./main/router');

const app = express();
app.use(express.json());
app.use(router);

const init = async () => {
    try {
        await db.init();

        const fileNames = await findFiles(conf.export.dir, conf.export.fileMask);
        const exportData = await Promise.all(_.map(fileNames, fileName => getExportData(`${conf.export.dir}/${fileName}`)));
        
    } catch (e) {
        console.error(e);
    }

    app.listen(conf.port, () => {
        console.log(`Server running on port: ${conf.port}`);
    });
}

setImmediate(init);
