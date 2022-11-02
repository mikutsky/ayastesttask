const employeesServices = require('../../main/services/employeesService');


const getEmployeesMore10percent = async () => {
    return employeesServices.getEmployeesMore10percent();
}

const getDepartmentDifferentMinMax = async () => {
    return employeesServices.getDepartmentDifferentMinMax();
}

const getEmployeesFeeFrom10k = async () => {
    return employeesServices.getEmployeesFeeFrom10k();
}

module.exports = { getEmployeesMore10percent, getDepartmentDifferentMinMax, getEmployeesFeeFrom10k }