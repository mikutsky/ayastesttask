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
        if (await this.db.schema.hasTable('departments')) return;

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
        if (await this.db.schema.hasTable('employees')) return;

        return this.db.schema
            .createTable('employees', (table) => {
                table.integer('id').primary();
                table.string('name', 63);
                table.string('surname', 63);
                table.integer('department_id')
                    .references('id')
                    .inTable('departments')
                    .onDelete('SET NULL');
            });
    }

    async createTableStatements() {
        if (await this.db.schema.hasTable('statements')) return;

        return this.db.schema
            .createTable('statements', (table) => {
                table.integer('id').primary();
                table.decimal('amount', 6, 2).notNullable().defaultTo(0);
                table.date('date').notNullable().defaultTo(new Date().toISOString());
                table.integer('employee_id')
                    .references('id')
                    .inTable('employees')
                    .onDelete('CASCADE');
            });
    }

    async createTableDonations() {
        if (await this.db.schema.hasTable('donations')) return;

        return this.db.schema
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
    }

    async createTableRates() {
        if (await this.db.schema.hasTable('rates')) return;

        return this.db.schema
            .createTable('rates', (table) => {
                table.string('hash', 22).notNullable().primary();
                table.date('date').notNullable().defaultTo(new Date().toISOString());
                table.specificType('value', 'double precision').notNullable().defaultTo(0);
                table.integer('currency_id')
                    .references('id')
                    .inTable('currencies')
                    .onDelete('CASCADE');
            });
    }

    async createTableCurrencies() {
        if (await this.db.schema.hasTable('currencies')) return;

        return this.db.schema
            .createTable('currencies', (table) => {
                table.increments('id').primary();
                table.string('sign', 3).unique();
            });
    }

    async addDefaultData() {
        return this.db('currencies').insert({ sign: 'USD' })
            .onConflict('sign')
            .ignore();
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

        await this.addDefaultData();

        return this.db;
    }
}

module.exports = new DataBase();
