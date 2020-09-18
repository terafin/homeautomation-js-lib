const _ = require('lodash')
const logging = require('homeautomation-js-lib/logging.js')

var running_average_map = {}
var values_thrown_away_counter = {}

const VALUES_FOR_RUNNING_AVERAGE = 8
const MIN_VALUES_FOR_RUNNING_AVERAGE_THRESHOLD = 3
const THRESHOLD_TO_THROW_AWAY = 6
const MAX_VALUES_TO_THROW_AWAY = 2

const default_options = {
    values_for_running_average: VALUES_FOR_RUNNING_AVERAGE,
    min_values_for_running_average_threshold: MIN_VALUES_FOR_RUNNING_AVERAGE_THRESHOLD,
    threshold_to_throw_away: THRESHOLD_TO_THROW_AWAY,
    max_values_to_throw_away: MAX_VALUES_TO_THROW_AWAY
}
module.exports.add_running_average = function(key, value, options) {
    if (_.isNil(options)) {
        options = default_options
    }

    var values_for_running_average = options['values_for_running_average']
    var min_values_for_running_average_threshold = options['min_values_for_running_average_threshold']
    var threshold_to_throw_away = options['threshold_to_throw_away']
    var max_values_to_throw_away = options['max_values_to_throw_away']

    if (_.isNil(values_for_running_average))
        values_for_running_average = VALUES_FOR_RUNNING_AVERAGE
    if (_.isNil(min_values_for_running_average_threshold))
        min_values_for_running_average_threshold = MIN_VALUES_FOR_RUNNING_AVERAGE_THRESHOLD
    if (_.isNil(threshold_to_throw_away))
        threshold_to_throw_away = THRESHOLD_TO_THROW_AWAY
    if (_.isNil(max_values_to_throw_away))
        max_values_to_throw_away = MAX_VALUES_TO_THROW_AWAY

    var values = running_average_map[key]

    if (_.isNil(values)) {
        values = []
        values_thrown_away_counter[key] = 0
    }

    const current_average = module.exports.running_average(key)
    const already_thrown_away = values_thrown_away_counter[key]
    const is_value_out_of_range = Math.abs(current_average - value) >= threshold_to_throw_away
    const do_we_have_enough_data = values.length >= min_values_for_running_average_threshold
    const throw_away_value = (is_value_out_of_range && do_we_have_enough_data) ?
        (already_thrown_away >= max_values_to_throw_away ? false : true) : false

    if (!throw_away_value) {
        values.push(value)

        if (values.length > values_for_running_average) {
            values.shift()
        }
        running_average_map[key] = values
        values_thrown_away_counter[key] = 0
    } else {
        values_thrown_away_counter[key] = values_thrown_away_counter[key] + 1
        logging.error('throwing away value: ' + value + '   current average: ' + current_average + '  thrown away count: ' + values_thrown_away_counter[key])
    }
}

module.exports.running_average = function(key) {
    var values = running_average_map[key]
    if (_.isNil(values)) {
        return 0
    }
    var average = 0

    values.forEach(value => {
        average += value
    })

    return (average / values.length).toFixed(2)
}