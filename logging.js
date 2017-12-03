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
var PrettyStream = require('bunyan-prettystream');
var prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

var logger = bunyan.createLogger({
    name: '' + logName,
    level: 'info',
    type: 'raw',
    stream: prettyStdOut
})


var splunkSettings = {
    token: process.env.SPLUNK_TOKEN,
    host: process.env.SPLUNK_HOST,
    source: 'home-automation',
    sourcetype: logName
}

console.log('starting winston logging for: ' + logName)

if (disableSyslog !== false) {
    logger.info(' => console logging enabled')
}

if (!_.isNil(splunkSettings.token)) {
    logger.info(' => splunk sending to: ' + splunkSettings.host + ':' + splunkSettings.token)
}


module.exports = logger