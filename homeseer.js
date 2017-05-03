const logging = require('./logging.js')
const request = require('request')
var homeseer_json_api_path = null

exports.set_path = function(new_path) {
    homeseer_json_api_path = new_path
}

exports.publish = function(deviceRefID, targetValue) {
    if (homeseer_json_api_path === null || homeseer_json_api_path === undefined) {
        logging.log('homeseer_json_api_path not defined')
        return
    }

    const JSON_Path = '/JSON?request=controldevicebyvalue&ref='
    var homeseer_url = homeseer_json_api_path + JSON_Path + deviceRefID + '&value=' + targetValue

    logging.log('request url: ' + homeseer_url)
    request(homeseer_url, function(error, response, body) {
        if ((response !== null) || (error !== null && error !== undefined)) {
            logging.log('error:', error)
            logging.log('statusCode:', response && response.statusCode)
            logging.log('body:', body)
        }
    })
}