const mqtt = require('mqtt')
const logging = require('./logging.js')
const _ = require('lodash')

var publish_map = {}

const fix_name = function(str) {
    str = str.replace(/[+\\&*%$#@!’]/g, '')
    str = str.replace(/\s/g, '_').trim().toLowerCase()
    str = str.replace(/__/g, '_')
    str = str.replace(/-/g, '_')

    return str
}

if (mqtt.MqttClient.prototype.smartPublish == null) {
    mqtt.MqttClient.prototype.smartPublish = function(topic, inMessage, options) {
        if (_.isNil(topic)) {
            logging.error('empty topic passed into mqtt_helpers.smartPublish')
            return
        }
        if (_.isNil(inMessage)) {
            logging.error('empty message passed into mqtt_helpers.smartPublish')
            return
        }

        topic = fix_name(topic)
        const message = inMessage.toString()

        logging.debug(' ' + topic + ':' + message)
        if (publish_map[topic] !== message) {
            publish_map[topic] = message
            logging.info(' => published: [' + topic + ':' + message + ']')
            this.publish(topic, message, options)
        } else {
            logging.debug(' * not published')
        }
    }
}

if (mqtt.MqttClient.prototype.smartPublishCollection == null) {
    mqtt.MqttClient.prototype.smartPublishCollection = function(prefix, collection, skipping, options) {
        if (_.isNil(collection)) {
            return
        }

        Object.keys(collection).forEach(key => {
            if (!_.isNil(skipping) && (skipping.indexOf(key) > -1)) {
                return
            }

            this.smartPublish(
                exports.generateTopic(prefix, key.toString()),
                collection[key].toString(),
                options)
        });

    }
}

const host = process.env.MQTT_HOST
const mqttUsername = process.env.MQTT_USER
const mqttPassword = process.env.MQTT_PASS
const mqttName = process.env.MQTT_NAME
var statusTopicPrefix = process.env.MQTT_STATUS_TOPIC_PREFIX

var logName = mqttName

if (_.isNil(logName)) {
    logName = process.env.name
}

if (_.isNil(logName)) {
    logName = process.env.LOGGING_NAME
}

if (_.isNil(statusTopicPrefix)) {
    statusTopicPrefix = '/status/'
}

if (mqtt.setupClient == null) {
    mqtt.setupClient = exports.setupClient
}

exports.setupClient = function(connectedCallback, disconnectedCallback) {
    if (_.isNil(host)) {
        logging.warn('MQTT_HOST not set, aborting')
        process.abort()
    }

    var mqtt_options = {}

    if (!_.isNil(mqttUsername)) {
        mqtt_options.username = mqttUsername
    }
    if (!_.isNil(mqttPassword)) {
        mqtt_options.password = mqttPassword
    }

    if (!_.isNil(logName)) {
        mqtt_options.will = {}
        mqtt_options.will.topic = fix_name(statusTopicPrefix + logName)
        mqtt_options.will.payload = '0'
        mqtt_options.will.retain = true
    }

    const client = mqtt.connect(host, mqtt_options)

    // MQTT Observation

    client.on('connect', () => {
        logging.info('MQTT Connected')

        publish_map = {}

        if (!_.isNil(logName)) {
            client.publish(fix_name('/status/' + logName), '1', { retain: true })
        }

        if (!_.isNil(connectedCallback)) {
            connectedCallback()
        }
    })

    client.on('disconnect', () => {
        logging.error('MQTT Disconnected, reconnecting')

        publish_map = {}

        client.connect(host)

        if (!_.isNil(disconnectedCallback)) {
            disconnectedCallback()
        }
    })

    return client
}

exports.generateTopic = function() {
    var topicString = ''
    var first = true

    for (var i = 0; i < arguments.length; i++) {
        const component = arguments[i].toString()
        if (first) {
            first = false
        } else {
            topicString = topicString + '/'
        }
        topicString = topicString + fix_name(component)
    }

    return topicString
}