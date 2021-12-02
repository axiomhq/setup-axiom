import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as stateHelper from './state-helper';

export async function main() {
  try {
    let version = core.getInput('axiom-version');
    core.info(`Starting Axiom ${version} stack`);
    core.startGroup('docker compose up -d');
    exec.exec('docker', ['compose', 'up', '-d', '--quiet-pull'], {
      env: {
        AXIOM_VERSION: version
      }
    });
    core.endGroup();
    // TODO: Set up Axiom and create a personal token
    core.info(`Axiom stack started and configured`);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

export async function post() {
  try {
    let version = core.getInput('axiom-version');
    core.info(`Stopping Axiom stack`);
    exec.exec('docker', ['compose', 'down', '-v'], {
      env: {
        AXIOM_VERSION: version
      }
    });
    core.info(`Axiom stack stopped`);
  } catch (error: any) {
    core.warning(error.message);
  }
}

if (!stateHelper.IsPost) {
  main();
} else {
  post();
}
