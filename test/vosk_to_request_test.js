var assert = require('assert');
var handler = require('../nodelib/vosk_to_request')

describe('vosk_to_request', function () {
  describe('#Handler()', function () {
    it('should return null when the result is not present', async function () {
        var res = await handler.Handler({});
        assert.equal(res, null);
    });
    it('should return object when the result is not present', async function () {
        var res = await handler.Handler({result: [{word: "hello"}]});
        assert.notEqual(res, null);
        // Should send to a voice request queue
        assert.equal(res.queue, "voice_request");
        assert.equal(res.content.request, "hello");
    });
  });
});
