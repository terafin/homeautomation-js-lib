const read_directory = require('read-directory')
const EventEmitter = require('events')
const watch = require('watch')
const yaml = require('js-yaml')
const logging = require('./logging.js')
const _ = require('lodash')

var configs = []
var config_path = null

module.exports = new EventEmitter()

module.exports.load_path = function(in_path) {
	config_path = in_path
	// Watch Path
	watch.watchTree(config_path, function(f, curr, prev) {
		logging.info('Updating rules')
		load_rule_config()
	})
}

module.exports.get_configs = function() {
	return configs
}

module.exports.ruleIterator = function(callback) {
	if (_.isNil(configs)) { 
		return
	}

	configs.forEach(function(config_item) {
		if (_.isNil(config_item)) {
			return 
		}

		Object.keys(config_item).forEach(function(key) {
			try {
				return callback(key, config_item[key])
			} catch (error) {
				logging.error('Failed callback for rule: ' + key)
			}
		}, this)
	}, this)
}

const print_rule_config = function() {
	if (_.isNil(configs)) { 
		return
	}

	configs.forEach(function(config_item) {
		if (_.isNil(config_item)) { 
			return 
		}

		Object.keys(config_item).forEach(function(key) {
			logging.debug(' Rule [' + key + ']')
		}, this)
	}, this)
}

const _load_rule_config = function() {
	read_directory(config_path, function(err, files) {
		configs = []

		logging.info('Loading rules at path: ' + config_path)
		if (err) {
			throw err
		}

		const fileNames = Object.keys(files)

		fileNames.forEach(file => {
			if (file.includes('._')) {
				return
			}
			if (file.includes('.yml') || file.includes('.yaml')) {
				logging.info(' - Loading: ' + file)
				const doc = yaml.safeLoad(files[file])
				configs.push(doc)
			} else {
				logging.info(' - Skipping: ' + file)
			}
		})

		logging.info('...done loading rules')
		print_rule_config()
		module.exports.emit('rules-loaded')
	})
}


const load_rule_config = function() {
	_.defer(_load_rule_config, 15 * 1000, {})
}
