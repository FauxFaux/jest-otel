const otel = require("@opentelemetry/api");
otel.diag.setLogger(new otel.DiagConsoleLogger(), otel.DiagLogLevel.DEBUG);
const needle = require("needle");
const { start, stop, trace } = require("../app/otel");

describe("foo", () => {
  beforeAll(start);
  it("fetches", async () => {
    await trace("fetch test", async () => {
      expect(await needle("get", "https://b.fau.xxx/404")).toMatchObject({
        statusCode: 404,
      });
    });
  });
  afterAll(stop);
});
