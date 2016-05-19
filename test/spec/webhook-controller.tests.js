
var request = require('supertest');

var app = require('../../app/app');

describe('WebhookController Tests', function() {

  describe('post()', function() {

    it('should work', function(done){

        request(app)
            .get('/ping')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, done);

    });

    it('should return a BAD REQUEST with an empty body', function (done) {
        request(app)
            .post('/webhook')
            .set('Accept', 'application/json')
            .send({})
            .expect('Content-Type', /json/)
            .expect(400, done);

    });

    it('should extract the order from a webhook from Ulule', function (done) {

        var body = {
            "type": "order.completed",
            "object": "event",
            "created": "2015-09-01T16:40:05.805422",
            "resource": {
                "type": "order",
                "uri": "https://api.ulule.com/v1/orders/1498142"
            }
        };

        request(app)
            .post('/webhook')
            .set('Accept', 'application/json')
            .send(body)
            .expect('Content-Type', /json/)
            .expect(200, {
                order_uri: 'https://api.ulule.com/v1/orders/1498142'
            }, done);

    });

  });
});
