const { default: JestRuntime } = require("jest-runtime");
const ourtel = require("../app/otel");

module.exports = class FunRuntime extends JestRuntime {
  constructor() {
    super(...arguments);
  }

  //
  // _loadModule(
  //   localModule, //: InitialModule,
  //   from, //: Config.Path,
  //   moduleName, //: string | undefined,
  //   modulePath, //: Config.Path,
  //   options, //: InternalModuleOptions | undefined,
  //   moduleRegistry, //: ModuleRegistry,
  // ) {
  //   return super._loadModule(...arguments);
  // }
  //
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
