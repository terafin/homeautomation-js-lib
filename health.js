const logging = require('./logging.js')
const url = require('url')
const _ = require('lodash')

var lastHealthEventDate = null

const http = require('http')

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


// VERY primitive REST server, method call is ignored (GET/POST)

const startHealthChecks = function(url, port, time) {
	healthCheckPort = port
	healthCheckTime = time
	if (url !== null) { 
		healthCheckURL = url 
	}

	http
		.createServer(function(request, response) {
			const requestUrl = url.parse(request.url)
			
			switch (requestUrl.pathname) {
			case healthCheckURL:
				var difference = Date.now() - lastHealthEventDate
				difference /= 1000
				logging.info('health check time difference: ' + difference)
	
				response.setHeader('Content-Type', 'text/html')

				if (difference > healthCheckTime) {
					response.writeHead(501, {'Content-Type': 'text/plain'})
					response.send('NOT OK difference: ' + difference)
				} else {
					response.writeHead(200, {'Content-Type': 'text/plain'})
					response.send('OK difference: ' + difference)
				}
				
				break

			default:
				logging.error('invalid url:', requestUrl.pathname)
			}
		})
		.listen(port, '0.0.0.0', () => {
			logging.info(' => health checks listening on: http://0.0.0.0:' + port + healthCheckURL)
		})
}


if (!_.isNil(healthCheckPort) && !_.isNil(healthCheckTime) && !_.isNil(healthCheckURL)) {
	startHealthChecks(healthCheckURL, healthCheckPort, healthCheckTime)
}
