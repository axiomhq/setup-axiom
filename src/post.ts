import * as core from '@actions/core';
import {exec} from '@actions/exec';

export async function run(dir: string) {
  try {
    let version = core.getInput('axiom-version');
    let port = core.getInput('axiom-port');

    core.startGroup('axiom-core logs');
    await exec('docker', ['compose', 'logs', 'axiom-core'], {
      cwd: dir,
      env: {
        AXIOM_VERSION: version,
        AXIOM_PORT: port
      }
    });
    core.endGroup();

    core.startGroup('axiom-db logs');
    await exec('docker', ['compose', 'logs', 'axiom-db'], {
      cwd: dir,
      env: {
        AXIOM_VERSION: version,
        AXIOM_PORT: port
      }
    });
    core.endGroup();

    core.startGroup('Stopping Axiom stack');
    await exec('docker', ['compose', 'down', '-v'], {
      cwd: dir,
      env: {
        AXIOM_VERSION: version,
        AXIOM_PORT: port
      }
    });
    core.endGroup();
  } catch (error: any) {
    core.warning(error.message);
  }
}
