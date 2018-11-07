const _ = require('lodash')
const disableSyslog = process.env.DISABLE_SYSLOG

var logName = process.env.name

if (_.isNil(logName)) {
	logName = process.env.LOGGING_NAME
}

if (_.isNil(logName)) {
	logName = 'logger'
}

const winston = require('winston')

require('winston-daily-rotate-file')

const dailyFileLogger = new (winston.transports.DailyRotateFile)({
	level: 'silly',
	filename: 'application-%DATE%.log',
	datePattern: 'YYYY-MM-DD-HH',
	zippedArchive: true,
	maxSize: '20m',
	maxFiles: '7d',
	dirname: '/var/log'
})

const consoleLogger = new winston.transports.Console( {level: 'info',
	format: winston.format.combine(
		winston.format.label({label: '[' + logName + ']'}),
		winston.format.colorize(), 
		winston.format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}), 
		winston.format.printf(info => `${info.timestamp} ${info.label} ${info.level}: ${info.message}`)
	),
})

var logger = winston.createLogger({
	levels: winston.config.cli.levels,
	transports: [consoleLogger, dailyFileLogger]
})
  
console.log('starting logging for: ' + logName)

if (disableSyslog !== false) {
	logger.info(' => console logging enabled')
}

module.exports = logger
