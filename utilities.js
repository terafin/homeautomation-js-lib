const _ = require('lodash')
const logging = require('homeautomation-js-lib/logging.js')

var running_average_map = {}
var values_thrown_away_counter = {}

const VALUES_FOR_RUNNING_AVERAGE = 8
const MIN_VALUES_FOR_RUNNING_AVERAGE_THRESHOLD = 3
const THRESHOLD_TO_THROW_AWAY = 6
const MAX_VALUES_TO_THROW_AWAY = 2

module.exports.add_running_average = function(key, value) {
    var values = running_average_map[key]
    if (_.isNil(values)) {
        values = []
        values_thrown_away_counter[key] = 0
    }

    const current_average = running_average(key)
    const already_thrown_away = values_thrown_away_counter[key]
    const is_value_out_of_range = Math.abs(current_average - value) >= THRESHOLD_TO_THROW_AWAY
    const do_we_have_enough_data = values.length >= MIN_VALUES_FOR_RUNNING_AVERAGE_THRESHOLD
    const throw_away_value = (is_value_out_of_range && do_we_have_enough_data) ?
        (already_thrown_away >= MAX_VALUES_TO_THROW_AWAY ? false : true) : false

    if (!throw_away_value) {
        values.push(value)

        if (values.length > VALUES_FOR_RUNNING_AVERAGE) {
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