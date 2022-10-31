const conf = require('../conf');

const { asyncWrapper } = require('../utils');

const { Router } = require('express');
const router = new Router();

router.get('/', asyncWrapper(() => ({status: 'OK'})));

module.exports = router;
