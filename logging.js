const _ = require('lodash')
var winston = require('winston')
require('winston-splunk-httplogger')

const disableSyslog = process.env.DISABLE_SYSLOG

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: []
});

var name = process.env.name

if (_.isNil(name)) {
    name = process.env.LOGGING_NAME
}

if (_.isNil(name)) {
    name = 'winston'
}

var splunkSettings = {
    token: process.env.SPLUNK_TOKEN,
    host: process.env.SPLUNK_HOST,
    source: 'home-automation',
    sourcetype: name
}

console.log('starting winston logging for: ' + name)

module.exports = logger


if (!_.isNil(splunkSettings.token)) {
    logger.add(Winston.transports.SplunkStreamEvent, { splunk: splunkSettings })
    logger.info(' => splunk sending to: ' + splunkSettings.host + ':' + splunkSettings.token)
}

if (disableSyslog !== false) {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
    logger.info(' => enabling console logging')
}