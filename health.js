const express = require('express')
const logging = require('./logging.js')
const _ = require('lodash')

var lastHealthEventDate = null

var healthCheckPort = process.env.HEALTH_CHECK_PORT
var healthCheckTime = process.env.HEALTH_CHECK_TIME
var healthCheckURL = process.env.HEALTH_CHECK_URL

exports.healthyEvent = function() {
	lastHealthEventDate = new Date()
	logging.debug('healthy event', {event: 'healthy-check', lastHealthEventDate: lastHealthEventDate})
}

exports.unhealthyEvent = function() {
	lastHealthEventDate = null
	logging.error('unhealthy event', {event: 'unhealthy-check', lastHealthEventDate: lastHealthEventDate})
}

exports.startHealthChecks = function(url, port, time) {
	// Deprecated API, pulls from environment naturally now
}

startHealthChecks = function(url, port, time) {
	healthCheckPort = port
	healthCheckTime = time
	if (url !== null) { 
		healthCheckURL = url 
	}

	const app = express()

	app.get(healthCheckURL, function(req, res) {
		if (lastHealthEventDate === null) {
			logging.info('health check, but nothing healthy')
			res.send('empty, bad')
			return
		}

		var difference = Date.now() - lastHealthEventDate
		difference /= 1000
		logging.debug('health check time difference: ' + difference)

		if (difference > healthCheckTime) {
			res.sendStatus(501)
		} else {
			res.send('OK difference: ' + difference)
		}
	})

	app.listen(healthCheckPort, function() {
		logging.info('health check listening on port: ', healthCheckPort)
	})
}


if (!_.isNil(healthCheckPort) && !_.isNil(healthCheckTime) && !_.isNil(healthCheckURL)) {
	startHealthChecks(healthCheckURL, healthCheckPort, healthCheckTime)
}
