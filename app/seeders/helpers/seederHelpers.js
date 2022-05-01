const moment = require('moment');

const ts = moment().utc().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
    timeStamps: {
        createdAt: ts,
        updatedAt: ts,
    },
}
