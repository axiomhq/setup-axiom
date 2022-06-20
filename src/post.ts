import * as core from '@actions/core';
import {exec} from '@actions/exec';
import semverGte from 'semver/functions/gte';

export async function run(dir: string) {
  try {
    const version = core.getInput('axiom-version');
    const env = {
      AXIOM_VERSION: version,
      // Starting with 1.21.0, DB exposes 8080 instead of 80
      AXIOM_DB_PORT: semverGte(version, '1.21.0') ? '8080' : '80',
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
