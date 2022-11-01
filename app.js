const _ = require('lodash');
const conf = require('./main/conf');
const database = require('./main/db');

const express = require('express');
const router = require('./main/router');

const app = express();
app.use(express.json());
app.use(router);

database.init()
    .then(() => {
        const exportService = require('./main/services/exportService');
        return exportService.exportFromDir();
    }).then(() => {
        app.listen(conf.port, () => {
            console.log(`Server running on port: ${conf.port}`);
        });
    }).catch((e) => console.error(e));

