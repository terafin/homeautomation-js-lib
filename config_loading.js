const fs = require('fs')
const path = require('path')
const watch = require('watch')
const EventEmitter = require('events')
const yaml = require('js-yaml')
const logging = require('./logging.js')
const _ = require('lodash')

var configs = []
var config_path = null

module.exports = new EventEmitter()

module.exports.load_path = function(in_path) {
    if (_.isNil(in_path)) {
        return
    }

    config_path = in_path

    // Watch Path
    watch.watchTree(config_path, {
        ignoreDotFiles: true,
        interval: 30
    }, function(f, curr, prev) {
        logging.info('Updating configs')
        load_device_config()
    })
}

module.exports.get_configs = function() {
    return configs
}

module.exports.deviceIterator = function(callback) {
    if (_.isNil(configs)) {
        return
    }

    configs.forEach(function(config_item) {
        if (_.isNil(config_item)) {
            return
        }

        Object.keys(config_item).forEach(function(key) {
            callback(key, config_item[key])
        }, this)
    }, this)
}

const _load_device_config = function() {
    try {
        fs.readdir(config_path, function(err, files) {
            configs = []

            logging.info('Loading configs at path: ' + config_path)
            if (err) {
                throw err
            }

            files.map(function(file) {
                return path.join(config_path, file)
            }).filter(function(file) {
                return fs.statSync(file).isFile()
            }).forEach(function(file) {
                if (file.includes('._')) {
                    return
                }
                if (file.includes('.yml') || file.includes('.yaml')) {
                    logging.info(' - Loading: ' + file)
                    const doc = yaml.load(fs.readFileSync(file, 'utf8'))
                    configs.push(doc)
                } else {
                    logging.info(' - Skipping: ' + file)
                }
            })

            logging.info('...done loading configs')
            module.exports.emit('config-loaded')
        })
    } catch (e) {
        logging.error('...config loaded failed: ' + e)
    }
}

const load_device_config = function() {
    _.defer(_load_device_config, 15 * 1000, {})
}