var assert = require('assert');
var handler = require('../nodelib/nl_processor');

describe('nl_processor', function () {
    describe('#Handler()', function () {
        it("should pull from the nl_request queue", function () {
            assert.equal(handler.Queue, "nl_request");
        })

        it('should return cnc move for a valid move statement', async function () {
            var res = await handler.Handler({ request: "move left 5 inches" });
            assert.notEqual(res, null);
        });

        it('should throw for an invalid command', async function () {
            assert.throws(() => {
                var res = handler.Handler({ request: "barf left 5 inches" });
            }, {
                message: "Unknown command: barf"
            });
        });

        it('should throw for an invalid move unit', async function () {
            assert.throws(() => {
                var res = handler.Handler({ request: "move left 5 asdf" });
            }, {
                message: "No unit found"
            });
        });

        const inches_to_mm = 25.4;
        const move_tests = {
            "left five inches": {
                x: -5 * inches_to_mm,
                y: 0,
                z: 0
            },
            "right 5 inches": {
                x: 5 * inches_to_mm,
                y: 0,
                z: 0
            },
            "forward 5 inches": {
                y: 5 * inches_to_mm,
                x: 0,
                z: 0
            },
            "back 5 inches": {
                y: -5 * inches_to_mm,
                x: 0,
                z: 0
            },
            "left 5 millimeters": {
                x: -5,
                y: 0,
                z: 0
            },
            "left 5 centimeters": {
                x: -50,
                y: 0,
                z: 0
            },
        }

        for (const [request, expected] of Object.entries(move_tests)) {
            it(`should return cnc move for a valid move statement: ${request}`, async function () {
                var res = await handler.Handler({ request: "move " + request });
                assert.equal(res.queue, "cnc_request");
                assert.notEqual(res, null);
                const content = res.content;
                assert.equal(content.command, "Move");
                assert.deepEqual(content.data, expected);
            });
        }
    });
});
