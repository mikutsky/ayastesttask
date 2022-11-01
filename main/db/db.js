const { env } = require('../conf');
const knex = require('knex');
const knexConfig = require('./knexfile.js')[env];
const _ = require('lodash');

let db = null;

const createDB = async () => {
    try {
        await db.raw(`CREATE DATABASE ${knexConfig.connection.database}`);
    } catch (e) {
        console.log(e.message)
    }
};

const createTableDepartments = async () => {
    try {
        await db.schema
            .createTable('departments', (table) => {
                table.integer('id').primary();
                table.string('name', 63);
            });
    } catch (e) {
        console.log(e.message)
    }
}

const createTableEmployees = async () => {
    try {
        await db.schema
            .createTable('employees', (table) => {
                table.integer('id').primary();
                table.string('name', 63);
                table.string('surname', 63);
                table.integer('department_id')
                    .references('id')
                    .inTable('departments')
                    .onDelete('SET NULL');
            });
    } catch (e) {
        console.log(e.message)
    }
}

const createTableStatements = async () => {
    try {
        await db.schema
            .createTable('statements', (table) => {
                table.integer('id').primary();
                table.decimal('amount', 6, 2).notNullable().defaultTo(0);
                table.date('date').notNullable().defaultTo(new Date().toISOString());
                table.integer('employee_id')
                    .references('id')
                    .inTable('employees')
                    .onDelete('CASCADE');
            });
    } catch (e) {
        console.log(e.message)
    }
}

const createTableDonations = async () => {
    try {
        await db.schema
            .createTable('donations', (table) => {
                table.integer('id').primary();
                table.date('date').notNullable().defaultTo(new Date().toISOString());
                table.decimal('amount', 6, 2).notNullable().defaultTo(0);
                table.integer('currency_id')
                    .references('id')
                    .inTable('currencies')
                    .onDelete('SET NULL');
                table.integer('employee_id')
                    .references('id')
                    .inTable('employees')
                    .onDelete('CASCADE');
            });
    } catch (e) {
        console.log(e.message)
    }
}

const createTableRates = async () => {
    try {
        await db.schema
            .createTable('rates', (table) => {
                table.string('hash', 22).notNullable().primary();
                table.date('date').notNullable().defaultTo(new Date().toISOString());
                table.specificType('value', 'double precision').notNullable().defaultTo(0);
                table.integer('currency_id')
                    .references('id')
                    .inTable('currencies')
                    .onDelete('CASCADE');
            });
    } catch (e) {
        console.log(e.message)
    }
}

const createTableCurrencies = async () => {
    try {
        await db.schema
            .createTable('currencies', (table) => {
                table.increments('id').primary();
                table.string('sign', 3).unique();
            });
    } catch (e) {
        console.log(e.message)
    }
}

const init = async (config = knexConfig) => {
    if (db) return db;

    const initKnexConfig = _.set(_.cloneDeep(knexConfig), 'connection.database', 'postgres');
    db = knex(initKnexConfig);

    await createDB(config.connection.database);

    db.destroy();
    db = knex(config);

    await createTableDepartments();
    await createTableEmployees();
    await createTableStatements();
    await createTableCurrencies();
    await createTableRates();
    await createTableDonations();

    return db;
}

const config = knexConfig;

module.exports = { config, init };
