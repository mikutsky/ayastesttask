const yaml = require('nconf-yaml');
const _ = require('lodash');

const itemsName = ['Employee', 'Statement', 'Rate', 'Donation'];
const unseparateItemsName = ['Donation'];
let isFirstUnseparated = true;

const prepareLines = (lines) => _.reduce(lines, (acc, line) => {
    if (_.isEmpty(line)) return acc;

    const fieldName = line.trim();
    const isItems = _.includes(itemsName, fieldName);
    const isUnseparate = _.includes(unseparateItemsName, fieldName);

    if (isItems) {
        const newLines = [];
        const spaceCount = line.indexOf(fieldName);
        const prefix = line.slice(0, spaceCount);
        isFirstUnseparated = isFirstUnseparated || !isUnseparate;

        if (isUnseparate && isFirstUnseparated) {
            newLines.push(`${prefix}${fieldName}s:`);
            isFirstUnseparated = false;
        }

        newLines.push(`${prefix}- _type: ${fieldName}`);

        return [...acc, ...newLines];
    }

    return [...acc, _.includes(line, ':') ? line : line.concat(':')];
}, []);

const parse = (obj, options) => {
    const fileLines = prepareLines(_.split(obj, '\n'));

    return yaml.parse(fileLines.join('\n'), options);
}

module.exports = { parse };
