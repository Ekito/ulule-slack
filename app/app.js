var express = require('express');
var bodyParser = require('body-parser');

var config = require('./config');

if (config.ulule.key === '' || config.ulule.username === ''  || config.slack.token === ''  || config.slack.channel === '' ) {

    console.log('OOPS :-(');
    console.log('Please configure your keys etc... in app/config.js');
} else {

    var request = require('request');

    var app = express();

    app.use(bodyParser.json());

    app.get('/ping', function(req, res) {
        res.status(200).json({ value: 'pong' });
    });

    app.post('/webhook', function(req, res) {

        if (req.body.resource && req.body.resource.uri) {

            var order_uri = req.body.resource.uri;

            var ulule_auth = config.ulule.username + ':' + config.ulule.key;

            request.get(order_uri, {
                headers: {
                    'Authorization': 'ApiKey ' + ulule_auth
                }
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var order = JSON.parse(body);

                    var message = order.order_total + '€ de ' + order.user.name +  ' (' + order.user.email + ') par ' + order.payment_method

                    console.log(message);

                    request.get('https://slack.com/api/chat.postMessage', {
                        qs: {
                            token:config.slack.token,
                            channel:config.slack.channel,
                            text: message,
                            pretty:1
                        }
                    }, function (error, response, body) {

                        console.log(body);

                        res.status(200).json({ order_uri: order_uri });
                    });

                } else {
                    console.log('ERROR', error, body);
                    res.status(400).json({ error: body });
                }


            });

        } else {
            res.status(400).json({});
        }


    });

    var port = process.env.PORT || 9000;

    app.listen(port, function () {
        console.log('App listening on port 9000!');
    });

    module.exports = app;

}