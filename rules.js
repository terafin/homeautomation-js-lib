const fs = require('fs')
const path = require('path')
const watch = require('watch')
const yaml = require('js-yaml')
const logging = require('./logging.js')

var configs = []
var config_path = null


exports.load_path = function(in_path) {
    config_path = in_path
        // Watch Path
    watch.watchTree(config_path, function(f, curr, prev) {
        logging.log('Updating rules')
        load_rule_config()
    })
}

exports.get_configs = function() {
    return configs
}

module.exports.ruleIterator = function(callback) {
    configs.forEach(function(config_item) {
        Object.keys(config_item).forEach(function(key) {
            callback(key, config_item[key])
        }, this)
    }, this)
}

function print_rule_config() {
    configs.forEach(function(config_item) {
        Object.keys(config_item).forEach(function(key) {
            logging.log(' Device [' + key + ']')
            const map = config_item[key]

            const topic = map['topic']
            const src_topic = map['change_topic']
            const voice = map['voice_control']
            const name = map['name']

            logging.log('            name: ' + name)
            logging.log('           topic: ' + topic)
            logging.log('       src_topic: ' + src_topic)
            logging.log('           voice: ' + voice)
            logging.log('')

        }, this)
    }, this)
}

function load_rule_config() {
    fs.readdir(config_path, function(err, files) {
        configs = []

        logging.log('Loading rules at path: ' + config_path)
        if (err) {
            throw err
        }

        files.map(function(file) {
            return path.join(config_path, file)
        }).filter(function(file) {
            return fs.statSync(file).isFile()
        }).forEach(function(file) {
            logging.log(' - Loading: ' + file)
            const doc = yaml.safeLoad(fs.readFileSync(file, 'utf8'))
            configs.push(doc)
        })

        logging.log('...done loading rules')
        print_rule_config()
    })
}