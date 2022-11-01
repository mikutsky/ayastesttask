const { env } = require('../conf');
const knex = require('knex');
const knexConfig = require('./knexfile.js')[env];
const _ = require('lodash');

class DataBase {
    constructor() {
        this.config = knexConfig;
        this.db = null;
    }

    async createDB() {
        try {
            await this.db.raw(`CREATE DATABASE ${this.config.connection.database}`);
        } catch (e) {
            console.log(e.message)
        }
    };

    async createTableDepartments() {
        try {
            await this.db.schema
                .createTable('departments', (table) => {
                    table.integer('id').primary();
                    table.string('name', 63);
                });
        } catch (e) {
            console.log(e.message)
        }
    }

    async createTableEmployees() {
        try {
            await this.db.schema
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

    async createTableStatements() {
        try {
            await this.db.schema
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

    async createTableDonations() {
        try {
            await this.db.schema
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

    async createTableRates() {
        try {
            await this.db.schema
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

    async createTableCurrencies() {
        try {
            await this.db.schema
                .createTable('currencies', (table) => {
                    table.increments('id').primary();
                    table.string('sign', 3).unique();
                });
        } catch (e) {
            console.log(e.message)
        }
    }

    async init(config = this.config) {
        if (this.db) return this.db;

        const initKnexConfig = _.set(_.cloneDeep(this.config), 'connection.database', 'postgres');
        this.db = knex(initKnexConfig);

        await this.createDB(config.connection.database);

        await this.db.destroy();
        this.db = knex(config);

        await this.createTableDepartments();
        await this.createTableEmployees();
        await this.createTableStatements();
        await this.createTableCurrencies();
        await this.createTableRates();
        await this.createTableDonations();

        return this.db;
    }
}

module.exports = new DataBase();
