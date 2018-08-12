const _ = require('lodash')
var bunyan = require('bunyan')
var PrettyStream = require('bunyan-prettystream')

const disableSyslog = process.env.DISABLE_SYSLOG

var logName = process.env.name

if (_.isNil(logName)) {
	logName = process.env.LOGGING_NAME
}

if (_.isNil(logName)) {
	logName = 'winston'
}

var prettyStdOut = new PrettyStream()
prettyStdOut.pipe(process.stdout)

var logger = bunyan.createLogger({
	name: '' + logName,
	level: (disableSyslog ? 'error' : 'info'),
	type: 'raw',
	stream: prettyStdOut
})


var splunkSettings = {
	token: process.env.SPLUNK_TOKEN,
	url: process.env.SPLUNK_HOST,
}

console.log('starting winston logging for: ' + logName)

if (disableSyslog !== false) {
	logger.info(' => console logging enabled')
}

if (!_.isNil(splunkSettings.token)) {
	logger.info(' => splunk sending to: ' + splunkSettings.url + ':' + splunkSettings.token)
	bunyan.addStream({
		name: logName,
		streams: [splunkStream]
	})
}


module.exports = logger
