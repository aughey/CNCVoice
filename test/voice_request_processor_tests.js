var assert = require('assert');
var handler = require('../nodelib/voice_request_processor')

describe('voice_request_processor', function () {
  describe('#Handler()', function () {
    it("should pull from the voice_request queue", function() {
        assert.equal(handler.Queue, "voice_request");
    })
    it('should return null when the start word is not present', async function () {
        var res = await handler.Handler({request: "foo"});
        assert.equal(res, null);
    });
    it('should return object when start word is present', async function () {
        var res = await handler.Handler({request: "alexander foo bar"});
        assert.notEqual(res, null);
        // flows to nl_request
        assert.equal(res.queue, "nl_request");
        // strips off start word 
        assert.equal(res.content.request, "foo bar");
    });
  });
});
