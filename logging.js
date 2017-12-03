const _ = require('lodash')
var bunyan = require('bunyan')

const disableSyslog = process.env.DISABLE_SYSLOG

var logName = process.env.name

if (_.isNil(logName)) {
    logName = process.env.LOGGING_NAME
}

if (_.isNil(logName)) {
    logName = 'winston'
}

var bunyanDebugStream = require('bunyan-debug-stream');

var logger = bunyan.createLogger({
    name: '' + logName,
    level: (disableSyslog ? 'error' : 'info'),
    type: 'raw',
    stream: bunyanDebugStream({
        basepath: __dirname, // this should be the root folder of your project.
        forceColor: true
    })
})


var splunkSettings = {
    token: process.env.SPLUNK_TOKEN,
    host: process.env.SPLUNK_HOST,
    source: 'home-automation',
    sourcetype: name
}

console.log('starting winston logging for: ' + name)

if (disableSyslog !== false) {
    logger.info(' => console logging enabled')
}

if (!_.isNil(splunkSettings.token)) {
    logger.info(' => splunk sending to: ' + splunkSettings.host + ':' + splunkSettings.token)
}


module.exports = logger