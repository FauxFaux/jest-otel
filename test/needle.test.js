jest.mock('@opentelemetry/api', () => global.REAL_OTEL_API);
jest.mock('require-in-the-middle', () => global.MOCK_RITM);
const { start, stop, trace } = require("../app/otel");
start();

const otel = require("@opentelemetry/api");
otel.diag.setLogger(new otel.DiagConsoleLogger(), otel.DiagLogLevel.DEBUG);
const needle = require("needle");

describe("foo", () => {
  it("fetches", async () => {
    await trace("fetch test", async () => {
      expect(await needle("get", "https://b.fau.xxx/404")).toMatchObject({
        statusCode: 404,
      });
    });
  });
  afterAll(stop);
});
