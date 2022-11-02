const _ = require('lodash');
const { db } = require('../db');
const ratesService = require('./ratesService');

class EmployeesService {
    constructor() {}

    async getEmployeesMore10percent() {
        // - find employees that donated more than 10% of their average salary for the last 6 months
        // and sort by minimum average salary
        return db('employees AS e')
            .leftJoin('statements AS s', 's.employee_id', 'e.id')
            .leftJoin('donations AS d', 'd.employee_id', 'e.id')
            .join('rates AS r', (jc) => {
                jc.on('r.date', '=', 'd.date')
                jc.andOn('r.currency_id', '=', 'd.currency_id')
            }, 'left')
            .select(
                db.raw(`e.id, e.name, e.surname, e.department_id`),
                db.raw(`ROUND(AVG(s.amount), 2) AS avg_salary`),
                db.raw(`ROUND(AVG(CASE WHEN s.date > 'Jul 01 2021' THEN s.amount ELSE NULL END), 2) AS avg_salary_6mo`),
                db.raw(`SUM(d.amount) AS avg_donation`),
                db.raw(`SUM(d.amount * r.value) AS avg_donation_usd`))
            .groupBy('e.id')
            .having(db.raw(`ROUND(AVG(CASE WHEN s.date > 'Jul 01 2021' THEN s.amount ELSE NULL END), 2) * 0.1 < SUM(d.amount * r.value)`))
            .orderBy('avg_salary')
    }

    async getDepartmentDifferentMinMax() {
        return db('employees AS e')
            .join('statements AS s', 's.employee_id', 'e.id')
            .select(
                db.raw(`e.id, e.department_id`),
                db.raw(`AVG(s.amount) AS avg_salary`)
            )
            .groupBy('e.id')
            .orderBy('avg_salary');
    }

    async addDepartments(departments = []) {
        const uniqDepartments = _.uniqBy(_.map(departments, ({ id, name }) => ({ id, name })), 'id');

        return _.isEmpty(uniqDepartments) ? []
            : db('departments').insert(uniqDepartments)
                .onConflict('id')
                .ignore()
                .returning('id');
    }

    async addStatements(statements = []) {
        const uniqStatements = _.uniqBy(statements, 'id');

        return _.isEmpty(uniqStatements) ? []
            : db('statements').insert(uniqStatements)
                .onConflict('id')
                .merge(['amount', 'date', 'employee_id'])
                .returning('id');
    }

    async addDonations(donations = []) {
        const uniqDonations = _.uniqBy(donations, 'id');

        return _.isEmpty(uniqDonations) ? []
            : db('donations').insert(uniqDonations)
                .onConflict('id')
                .merge(['amount', 'date', 'employee_id'])
                .returning('id');
    }

    async addEmployees(employees) {
        const departments = _.map(employees, ({ Department: { id, name } }) => ({ id, name }));
        await this.addDepartments(departments);

        const _employees = _.map(employees, employee => {
            const departmentId = _.get(employee, ['Department', 'id'], null);
            const _employee = _.pick(employee, ['id', 'name', 'surname']);

            return _.set(_employee, ['department_id'], departmentId);
        });
        const uniqEmployees = _.uniqBy(_employees, 'id');
        const result = _.isEmpty(uniqEmployees) ? []
            : await db('employees').insert(uniqEmployees)
                .onConflict('id')
                .merge(['name', 'surname', 'department_id'])
                .returning('id');

        const statements = _.reduce(employees, (acc, { id, Salary }) => {
            const statements = _.map(Salary, statement => _.omit({...statement, employee_id: id}, '_type'));
            return [...acc, ...statements];
        }, []);
        await this.addStatements(statements);

        const currencies = await ratesService.getCurrencies();
        const donations = _.reduce(employees, (acc, { id, Donations }) => {
            const donations = _.map(Donations, donation => {
                const amount = _.get(donation, ['amount'], '0')
                const floatAmount = parseFloat(amount);
                const signAmount = amount.split(' ')[1];
                const _currency = _.find(currencies, ({ sign }) => sign === signAmount);
                const currencyId = _.get(_currency, ['id'], null);

                const _donation = _.pick({...donation, employee_id: id}, ['id', 'date', 'amount', 'employee_id']);
                _.set(_donation, ['amount'], floatAmount);
                _.set(_donation, ['currency_id'], currencyId);
                _.set(_donation, ['employee_id'], id);

                return _donation;
            });

            return [...acc, ...donations];
        }, []);

        await this.addDonations(donations);

        return result;
    }
}

module.exports = new EmployeesService();
