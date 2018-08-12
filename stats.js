var graphite = require('graphite')
const _ = require('lodash')

var metricPrefix = process.env.METRIC_PREFIX
var metricHost = process.env.METRIC_HOST
var metricPort = process.env.METRIC_PORT

if (_.isNil(metricPrefix)) {
	metricPrefix = 'home_metric'
}

var client = null

module.exports.submit = function(name, value) {
	if (_.isNil(metricHost) || _.isNil(metricPort)) {
		return
	}

	if (_.isNil(client)) {
		client = graphite.createClient('plaintext://' + metricHost + ':' + metricPort + '/')
	}

	var mqtt_rules = {}
	var thisMetric = {}

	mqtt_rules[name] = value
	thisMetric[metricPrefix] = mqtt_rules

	client.write(thisMetric, function(err) {
		if (!_.isNil(err)) {
			console.log('failed to submit   ' + JSON.stringify(thisMetric) + ' err:' + err)
		}
	})
}
