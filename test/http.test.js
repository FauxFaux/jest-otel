jest.mock('@opentelemetry/api', () => global.REAL_OTEL_API);

const otel = require('@opentelemetry/api');
const { start, stop, trace } = require("../app/otel");
const http = require("http");

describe("foo", () => {
  beforeAll(start);
  it("fetches", async () => {
    // valid (but empty)
    console.log(otel.context.active());
    await trace("fetch test", async () => {

      // picked up the context here
      console.log(otel.context.active());

      const resp = await new Promise((resolve) =>
        http.get("http://fau.xxx", resolve)
      );
      expect(resp).toMatchObject({
        statusCode: 301,
      });
    });
  });
  afterAll(stop);
});
