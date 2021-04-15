const otel = require("@opentelemetry/api");
otel.diag.setLogger(new otel.DiagConsoleLogger(), otel.DiagLogLevel.DEBUG);
const { start, stop, trace } = require("../app/otel");

async function main() {
  start();

  const needle = require("needle");
  await trace("fetch test", async () => {
    console.log((await needle("get", "https://b.fau.xxx/404")).statusCode);
  });

  await stop();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 2;
});
