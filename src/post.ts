import * as core from '@actions/core';
import {exec} from '@actions/exec';

export async function run() {
  try {
    let version = core.getInput('axiom-version');
    core.info(`Stopping Axiom stack`);
    exec('docker', ['compose', 'down', '-v'], {
      env: {
        AXIOM_VERSION: version
      }
    });
    core.info(`Axiom stack stopped`);
  } catch (error: any) {
    core.warning(error.message);
  }
}
