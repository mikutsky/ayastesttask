const invoke = require('./invoke');
const { asyncWrapper } = require('../utils');

const { Router } = require('express');
const router = new Router();

router.get('/', asyncWrapper(() => ({ status: 'OK' })));

// - find employees that donated more than 10% of their average salary for the last 6 months
// and sort by minimum average salary
router.get('/more10', asyncWrapper(invoke.getEmployeesMore10percent));

// - find departments in descending order of the difference between the maximum and minimum average salary,
//     for each department up to 3 employees with the largest increase in salary for the year (in percent) and the size of the last salary
router.get('/minmax', asyncWrapper(invoke.getDepartmentDifferentMinMax));

router.get('/fee10k', asyncWrapper(invoke.getEmployeesFeeFrom10k));

module.exports = router;
