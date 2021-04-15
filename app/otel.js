const otel = require("@opentelemetry/api");
const { NodeTracerProvider } = require("@opentelemetry/node");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} = require("@opentelemetry/tracing");

const tracerProvider = new NodeTracerProvider();
let tracer;

const instrumentations = [new HttpInstrumentation()];

function start() {
  registerInstrumentations({
    instrumentations,
  });

  tracerProvider.addSpanProcessor(
    new SimpleSpanProcessor(new ConsoleSpanExporter())
  );
  tracerProvider.register();
  tracer = otel.trace.getTracer("appy");
}

async function stop() {
  await tracerProvider.shutdown();
}

async function trace(name, fn) {
  const span = tracer.startSpan(name);
  return otel.context.with(
    otel.setSpan(otel.context.active(), span),
    async () => {
      try {
        return await fn();
      } finally {
        span.end();
      }
    }
  );
}

module.exports = { tracerProvider, instrumentations, trace, start, stop };
