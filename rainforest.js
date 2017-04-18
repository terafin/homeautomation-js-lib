logging = require('./logging.js')
request = require('request');
repeat = require('repeat');
xml_parser = require('xml2js');
current_speed = null

rainforest_ip = null
rainforest_user = null
rainforest_pass = null
client_callback = null

exports.set_ip = function(ip_address) {
    rainforest_ip = ip_address
}

exports.set_user_pass = function(username, password) {
    rainforest_user = username
    rainforest_pass = password
}

exports.set_callback = function(callback) {
    client_callback = callback
    start_monitoring()
}


function send_request(command, callback) {
    rainforest_url = "http://" + airscape_ip + "/cgi-bin/cgi_manager"
    body_payload = "<LocalCommand><Name>get_usage_data</Name><MacId>0xd8d5b90000009e89</MacId></LocalCommand>"

    logging.log('request url: ' + airscape_url)

    request.post({ url: rainforest_url, payload: body_payload },
        function(err, httpResponse, body) {
            logging.log("error:" + error);
            logging.log("statusCode:" + httpResponse && httpResponse.statusCode);
            logging.log("body:" + body);
            if (callback !== null && callback !== undefined) {
                callback(error, body)
            }
        }).auth(rainforest_user, rainforest_pass, false);;
}

function check_power() {
    logging.log("Checking power...")

    send_request(null, function(error, body) {
        if (client_callback !== null && client_callback !== undefined) {
            try {
                body_list = body.split("\n")
                fixed_lines = body_list.map(function(line) {
                    return line.substr(line.indexOf('<'));
                });
                body = fixed_lines.join("\n")
                body = '<?xml version="1.0" encoding="utf-8"?>\n<root>\n' + body + "</root>"

                xml_parser.parseString(body, { trim: true }, function(err, result) {
                    client_callback(result.root)
                    current_speed = result.root.fanspd
                });
            } catch (err) {}
        }
    })
}

function start_monitoring() {
    logging.log("Starting to monitor: " + airscape_ip)
    repeat(check_fan).every(5, 's').start.in(1, 'sec');
}

function speed_up() {
    logging.log("... upping speed")
    send_airscape_request(1, null)
}