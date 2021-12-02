import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as http from '@actions/http-client';
import {tokens} from '@axiomhq/axiom-node';

const AxiomUrl = 'http://localhost:8080';
const AxiomEmail = 'info@axiom.co';
const AxiomPassword = 'setup-axiom';

const sleep = (ms: number) => {
  return new Promise((resolve, _reject) => setTimeout(resolve, ms));
};

async function startStack(version: string) {
  await exec.exec('docker', ['compose', 'up', '-d', '--quiet-pull'], {
    env: {
      AXIOM_VERSION: version
    }
  });
}

async function waitUntilReady(client: http.HttpClient) {
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
  const res = await client.postJson(`${AxiomUrl}/auth/init`, {
    org: 'setup-axiom',
    name: 'setup-axiom',
    email: AxiomEmail,
    password: AxiomPassword
  });
  if (res.statusCode !== 200) {
    throw new Error(`Failed to initialize deployment`);
  }
}

async function createPersonalToken(client: http.HttpClient): Promise<string> {
  const sessionRes = await client.post(
    `${AxiomUrl}/auth/signin/credentials`,
    JSON.stringify({
      email: AxiomEmail,
      password: AxiomPassword
    }),
    {
      'Content-Type': 'application/json'
    }
  );
  const cookieHeader = sessionRes.message.headers['set-cookie'];
  if (!cookieHeader) {
    throw new Error(
      `Failed to get session cookie, please create an issue at <https://github.com/axiomhq/setup-axiom/issues/new>`
    );
  }
  const cookie = cookieHeader[0].split(';')[0];

  const tokenRes = await client.postJson<tokens.Token>(
    `${AxiomUrl}/api/v1/tokens/personal`,
    {
      name: 'setup-axiom',
      description:
        'This token is automatically created by github.com/axiomhq/setup-axiom'
    },
    {cookie}
  );

  const rawToken = await client.getJson<tokens.RawToken>(
    `${AxiomUrl}/api/v1/tokens/personal/${tokenRes.result!.id}/token`,
    {cookie}
  );

  await client.post(`${AxiomUrl}/logout`, '', {cookie});

  return rawToken.result!.token;
}

export async function run() {
  try {
    let version = core.getInput('axiom-version');
    const client = new http.HttpClient('github.com/axiomhq/setup-axiom');

    core.info(`Setting up Axiom ${version}`);

    core.startGroup('Starting stack');
    await startStack(version);
    core.endGroup();

    core.info('Waiting until Axiom is ready');
    await waitUntilReady(client);

    core.info('Initializing deployment');
    await initializeDeployment(client);

    core.info('Creating personal token');
    const personalToken = await createPersonalToken(client);
    core.setOutput('personal-token', personalToken);

    core.info(`Axiom is running and configured`);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}
