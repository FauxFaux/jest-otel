const otel = require("@opentelemetry/api");
otel.diag.setLogger(new otel.DiagConsoleLogger(), otel.DiagLogLevel.DEBUG);
const { start, stop, trace } = require("../app/otel");

const http = require("http");

async function main() {
  start();

  const needle = require("needle");
  await trace("fetch test", async () => {
    const resp = await new Promise((resolve) =>
      http.get("http://fau.xxx", resolve)
    );
    console.log(resp.statusCode);
  });

  await stop();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 2;
});
