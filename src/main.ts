import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as http from '@actions/http-client';

const AxiomUrl = 'http://localhost:8080';

const sleep = (ms: number) => {
  return new Promise((resolve, _reject) => setTimeout(resolve, ms));
};

async function startStack(version: string) {
  core.startGroup('docker compose up -d');
  await exec.exec('docker', ['compose', 'up', '-d', '--quiet-pull'], {
    env: {
      AXIOM_VERSION: version
    }
  });
  core.endGroup();
}

async function waitUntilReady(client: http.HttpClient) {
  core.info('Waiting until Axiom is ready');
  for (let i = 0; i < 10; i++) {
    try {
      await client.get(AxiomUrl);
      break; // Reachable
    } catch (error: any) {
      await sleep(1000);
    }
  }
}

async function initializeDeployment(client: http.HttpClient) {
  core.info('Initializing deployment');
  const res = await client.postJson(`${AxiomUrl}/auth/init`, {
    org: 'setup-axiom',
    name: 'setup-axiom',
    email: 'info@axiom.co',
    password: 'setup-axiom'
  });
  if (res.statusCode !== 200) {
    throw new Error(`Failed to initialize deployment`);
  }
}

export async function run() {
  try {
    let version = core.getInput('axiom-version');
    const client = new http.HttpClient('github.com/axiomhq/setup-axiom');

    core.info(`Starting Axiom ${version} stack`);
    await startStack(version);
    await waitUntilReady(client);
    await initializeDeployment(client);

    core.info(`Axiom stack started and configured`);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}
