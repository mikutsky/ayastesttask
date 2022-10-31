require('dotenv').config();
const { join } = require('path');
const nconf = require('nconf');
const yaml = require('nconf-yaml');

const getFullPath = (fileName = '') => join(__dirname, '../', fileName);

class Conf {
    constructor(file) {
        const conf = nconf.argv().env().file({ file, format: yaml });
        this.init(conf.get());
    }

    init(conf) {
        this.env = String(conf['ENV']);
        this.port = Number(conf['PORT']);

        this.dbConfig = {
            host: String(conf['DB_HOST']),
            port: Number(conf['DB_PORT']),
            database: String(conf['DB_NAME']),
            user: String(conf['DB_USER']),
            password: String(conf['DB_PASSWORD']),
            max: Number(conf['DB_MAX']),
            min: Number(conf['DB_MIN']),
            connectionTimeoutMillis: Number(conf['DB_CONNECTION_TIMEOUT_MILLIS']),
            idleTimeoutMillis: Number(conf['DB_IDLE_TIMEOUT']),
        };
        
        this.export = {
            dir: getFullPath(String(conf['EXPORT_DIR'])),
            fileMask: String(conf['EXPORT_FILEMASK']),
        }
    }
}

module.exports = new Conf(getFullPath('settings.yaml'));
