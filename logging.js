const _ = require('lodash')
var logLevel = process.env.LOG_LEVEL
var logName = process.env.name

if (_.isNil(logName)) {
    logName = process.env.LOGGING_NAME
}

if (_.isNil(logName)) {
    logName = 'logger'
}

if (_.isNil(logLevel)) {
    logLevel = 'INFO'
}

// const log4js = require('log4js')
// const logger = log4js.getLogger(logName)

// logger.level = logLevel

module.exports = console