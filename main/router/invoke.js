const employeesServices = require('../../main/services/employeesService');


const getEmployeesMore10percent = async () => {
    return employeesServices.getEmployeesMore10percent();
}

const getDepartmentDifferentMinMax = async () => {
    return employeesServices.getDepartmentDifferentMinMax();
}

module.exports = { getEmployeesMore10percent, getDepartmentDifferentMinMax }