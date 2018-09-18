var net = require('net'),
    sinon = require('sinon');

describe('protocolProfileBehavior', function () {
    var server,
        testrun,
        PORT = 5050,
        URL = 'http://localhost:' + PORT;

    before(function (done) {
        // Echo raw request message to handle body for http methods (GET, HEAD)
        // Node's `http` server won't parse body for GET method.
        server = net.createServer(function (socket) {
            socket.on('data', function (chunk) {
                var raw = chunk.toString(); // Request Message: [POSTMAN / HTTP/1.1 ...]
                socket.write('HTTP/1.1 200 ok\r\n');
                socket.write('Content-Type: text/plain\r\n\r\n');
                socket.write(raw); // respond with raw request message
                socket.end();
            });
        }).listen(PORT, done);
    });

    after(function (done) {
        server.close(done);
    });

    describe('with disableBodyPruning: true', function () {
        before(function (done) {
            this.run({
                collection: {
                    item: [{
                        request: {
                            url: URL,
                            method: 'GET',
                            body: {
                                mode: 'raw',
                                raw: 'foo=bar'
                            }
                        },
                        protocolProfileBehavior: {
                            disableBodyPruning: true
                        }
                    }]
                }
            }, function (err, results) {
                testrun = results;
                done(err);
            });
        });

        it('should complete the run', function () {
            expect(testrun).be.ok();
            sinon.assert.calledOnce(testrun.start);
            sinon.assert.calledOnce(testrun.done);
            sinon.assert.calledWith(testrun.done.getCall(0), null);
        });

        it('should send body with GET method correctly', function () {
            sinon.assert.calledOnce(testrun.request);
            sinon.assert.calledWith(testrun.request.getCall(0), null);

            sinon.assert.calledOnce(testrun.response);
            sinon.assert.calledWith(testrun.response.getCall(0), null);

            var response = testrun.request.getCall(0).args[2].stream.toString();

            expect(response).to.contain('GET / HTTP/1.1');
            expect(response).to.contain('Content-Type: text/plain');
            expect(response).to.contain('foo=bar');
        });
    });

    describe('with disableBodyPruning: false', function () {
        before(function (done) {
            this.run({
                collection: {
                    item: [{
                        request: {
                            url: URL,
                            method: 'GET',
                            body: {
                                mode: 'raw',
                                raw: 'foo=bar'
                            }
                        },
                        protocolProfileBehavior: {
                            disableBodyPruning: false
                        }
                    }]
                }
            }, function (err, results) {
                testrun = results;
                done(err);
            });
        });

        it('should complete the run', function () {
            expect(testrun).be.ok();
            sinon.assert.calledOnce(testrun.start);
            sinon.assert.calledOnce(testrun.done);
            sinon.assert.calledWith(testrun.done.getCall(0), null);
        });

        it('should not send body with GET method', function () {
            sinon.assert.calledOnce(testrun.request);
            sinon.assert.calledWith(testrun.request.getCall(0), null);

            sinon.assert.calledOnce(testrun.response);
            sinon.assert.calledWith(testrun.response.getCall(0), null);

            var response = testrun.request.getCall(0).args[2].stream.toString();

            expect(response).to.contain('GET / HTTP/1.1');
            expect(response).to.not.contain('Content-Type');
            expect(response).to.not.contain('foo=bar');
        });
    });

    describe('with disableBodyPruning: undefined', function () {
        before(function (done) {
            this.run({
                collection: {
                    item: [{
                        request: {
                            url: URL,
                            method: 'GET',
                            body: {
                                mode: 'raw',
                                raw: 'foo=bar'
                            }
                        }
                    }]
                }
            }, function (err, results) {
                testrun = results;
                done(err);
            });
        });

        it('should complete the run', function () {
            expect(testrun).be.ok();
            sinon.assert.calledOnce(testrun.start);
            sinon.assert.calledOnce(testrun.done);
            sinon.assert.calledWith(testrun.done.getCall(0), null);
        });

        it('should not send body by default for GET method', function () {
            sinon.assert.calledOnce(testrun.request);
            sinon.assert.calledWith(testrun.request.getCall(0), null);

            sinon.assert.calledOnce(testrun.response);
            sinon.assert.calledWith(testrun.response.getCall(0), null);

            var response = testrun.request.getCall(0).args[2].stream.toString();

            expect(response).to.contain('GET / HTTP/1.1');
            expect(response).to.not.contain('Content-Type');
            expect(response).to.not.contain('foo=bar');
        });
    });
});