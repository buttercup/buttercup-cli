import sinon from "sinon";
import test from "ava";

import { initConfig } from "../src/bcup-init-config";

for (const [name, configExists, expectWriteCalled] of [
  ["no existing config calls write", false, true],
  ["existing config doesn't write", true, false]
]) {
  let mockFs = {
    existsSync: sinon.fake.returns(configExists),
    writeFile: sinon.fake()
  };

  initConfig(mockFs);

  test(name, t => {
    t.true(mockFs.existsSync.called); // because this is always called
    t.is(mockFs.writeFile.called, expectWriteCalled);
  });
}
