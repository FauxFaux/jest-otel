const { default: JestRuntime } = require("jest-runtime");
const ourtel = require("../app/otel");

module.exports = class FunRuntime extends JestRuntime {
  constructor() {
    super(...arguments);
    this._environment.global.REAL_OTEL_API = require('@opentelemetry/api');
  }

  _requireCoreModule(moduleName /* string */) {
    let upper = super._requireCoreModule(moduleName);
    if (!["http", "https"].includes(moduleName)) return upper;
    for (const ins of ourtel.instrumentations) {
      for (const module of ins._modules) {
        upper = ins._onRequire(module, upper, moduleName, null);
      }
    }
    return upper;
  }
};
