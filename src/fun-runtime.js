const { default: JestRuntime } = require("jest-runtime");
const otel = require('@opentelemetry/api');

module.exports = class FunRuntime extends JestRuntime {
  // ([
  //   modules: string[] | undefined,
  //   options: { internals?: true },
  //   onRequire: (
  //     exports: realModule,
  //     name: string,
  //     basedir: string | undefined,
  //   ) => realModule,
  // ] | undefined)[]
  ritms = [];

  constructor() {
    super(...arguments);
    this._environment.global.REAL_OTEL_API = otel;

    this._environment.global.MOCK_RITM = (modulesOrOptionsOrFunction, optionsOrFunction, onRequire) => {
      // https://www.npmjs.com/package/require-in-the-middle
      this.ritms.push(parseArgs(modulesOrOptionsOrFunction, optionsOrFunction, onRequire));
      const id = this.ritms.length - 1;
      return { unhook: () => this.ritms[id] = undefined };
    }
  }

  _requireCoreModule(moduleName /* string */) {
    let upper = super._requireCoreModule(moduleName);
    for (const ritm of this.ritms) {
      if (!ritm) continue;
      const [modules, options, onRequire] = ritm;
      if (!modules.includes(moduleName)) continue;
      upper = onRequire(upper, moduleName, undefined);
    }
    return upper;
  }
};

// -ing js developers
function parseArgs(modulesOrOptionsOrFunction, optionsOrFunction, onRequire) {
  let modules, options, func;
  if (onRequire) {
    modules = modulesOrOptionsOrFunction;
    options = optionsOrFunction;
    func = onRequire;
  } else if (optionsOrFunction) {
    if (Array.isArray(modulesOrOptionsOrFunction)) {
      modules = modulesOrOptionsOrFunction;
      options = {};
      func = optionsOrFunction;
    } else {
      modules = undefined;
      options = modulesOrOptionsOrFunction;
      func = optionsOrFunction;
    }
  } else {
    modules = undefined;
    options = {};
    func = modulesOrOptionsOrFunction;
  }

  if (typeof options !== 'object') throw new Error(`error parsing insane arguments for options: ${typeof options}`);
  if (typeof func !== 'function') throw new Error(`error parsing insane arguments for func: ${typeof func}`);
  if (modules && !Array.isArray(modules)) throw new Error(`error parsing insane arguments for modules: ${modules}`);
  return [ modules, options, func ];
}
