const _ = require('lodash')
var bunyan = require('bunyan')

const disableSyslog = process.env.DISABLE_SYSLOG

var name = process.env.name

if (_.isNil(name)) {
    name = process.env.LOGGING_NAME
}

if (_.isNil(name)) {
    name = 'winston'
}

var logger = bunyan.createLogger({ name: name })


var splunkSettings = {
    token: process.env.SPLUNK_TOKEN,
    host: process.env.SPLUNK_HOST,
    source: 'home-automation',
    sourcetype: name
}

console.log('starting winston logging for: ' + name)

if (disableSyslog !== false) {
    var bunyanDebugStream = require('bunyan-debug-stream');
    logger.addStream({
        level: 'info',
        type: 'raw',
        stream: bunyanDebugStream({
            basepath: __dirname, // this should be the root folder of your project.
            forceColor: true
        })
    });

    logger.info(' => enabling console logging')
    logger.warn(' => enabling console logging warn')
    logger.error(' => enabling console logging error')

    logger.info('Hello again distributed logs');
}

if (!_.isNil(splunkSettings.token)) {
    logger.info(' => splunk sending to: ' + splunkSettings.host + ':' + splunkSettings.token)
}


module.exports = logger