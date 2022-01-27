import * as core from '@actions/core';
import {exec} from '@actions/exec';

export async function run(dir: string) {
  try {
    const env = {
      AXIOM_VERSION: core.getInput('axiom-version'),
      AXIOM_PORT: core.getInput('axiom-port'),
      AXIOM_LICENSE_TOKEN: core.getInput('axiom-license'),
      AXIOM_DB_IMAGE: core.getInput('axiom-db-image'),
      AXIOM_CORE_IMAGE: core.getInput('axiom-core-image')
    };

    core.startGroup('axiom-core logs');
    await exec('docker', ['compose', 'logs', 'axiom-core'], {cwd: dir, env});
    core.endGroup();

    core.startGroup('axiom-db logs');
    await exec('docker', ['compose', 'logs', 'axiom-db'], {cwd: dir, env});
    core.endGroup();

    core.startGroup('Stopping Axiom stack');
    await exec('docker', ['compose', 'down', '-v'], {cwd: dir, env});
    core.endGroup();
  } catch (error: any) {
    core.warning(error.message);
  }
}
