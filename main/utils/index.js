const _ = require('lodash');
const crypto = require('crypto');
const fs = require('fs/promises');
const customExport = require('./customExport');

const asyncWrapper = (callback) => {
    return async (req, res, next) => {
        try {
            const result = await callback(req, res);
            if (typeof result === 'object') {
                res.status(200).json(result);
            }
        } catch (err) {
            next(err);
        }
    };
};

const findFiles = async (dir, filemask) => {
    const preparedMask = filemask
        .replaceAll('.', '[.]')
        .replaceAll('*', '.*')
        .replaceAll('?', '.');

    const regex = new RegExp(`^${preparedMask}$`);
    const fileNames = await fs.readdir(dir);

    return _.filter(fileNames, fileName => regex.test(fileName));
};

const getExportData = async (fileName) => {
    const data = await fs.readFile(fileName, 'utf8');

    return customExport.parse(data);
}

const getMD5 = (data = '') => {
    const _data = typeof data === 'object' ? JSON.stringify(data) : String(data);

    return crypto.createHash('md5').update(_data).digest("base64url");
}

module.exports = { asyncWrapper, findFiles, getExportData, getMD5 };
