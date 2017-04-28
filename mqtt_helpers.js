const logging = require('./logging.js')
const mqtt = require('mqtt')

var publish_map = {}

function fix_name(str) {
    str = str.replace(/[+\\\&\*\%\$\#\@\!]/g, '')
    str = str.replace(/\s/g, '_').trim().toLowerCase()
    str = str.replace(/__/g, '_')
    return str
}

if (mqtt.MqttClient.prototype.smartPublish == null) mqtt.MqttClient.prototype.smartPublish = function(topic, message) {
    if (topic === null) {
        logging.warn('empty client or topic passed into mqtt_helpers.publish')
        return
    }
    topic = fix_name(topic)

    logging.log(' ' + topic + ':' + message)
    if (publish_map[topic] !== message) {
        publish_map[topic] = message
        logging.log(' => published!')
        this.publish(topic, message)
    } else {
        logging.log(' * not published')
    }
}