const _ = require('lodash')
var Winston = require('winston')
require('winston-splunk-httplogger')

const disableSyslog = process.env.DISABLE_SYSLOG

var winston = new(Winston.Logger)({
    transports: []
})

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

module.exports = winston


if (!_.isNil(splunkSettings.token)) {
    winston.add(Winston.transports.SplunkStreamEvent, { splunk: splunkSettings })
    winstin.info(' => splunk sending to: ' + splunkSettings.host + ':' + splunkSettings.token)
}

if (disableSyslog !== false) {
    winston.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
    winston.info(' => enabling console logging')
}