import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as http from '@actions/http-client';
import {tokens} from '@axiomhq/axiom-node';
import * as io from '@actions/io';
import * as fs from 'fs';
import * as dockerCompose from './docker-compose';

const AxiomEmail = 'info@axiom.co';
const AxiomPassword = 'setup-axiom';

const sleep = (ms: number) => {
  return new Promise((resolve, _reject) => setTimeout(resolve, ms));
};

async function waitUntilReady(client: http.HttpClient, url: string) {
  for (let i = 0; i < 10; i++) {
    try {
      await client.get(url);
      break; // Reachable
    } catch (error: any) {
      await sleep(1000);
    }
  }
}

async function initializeDeployment(client: http.HttpClient, url: string) {
  const res = await client.postJson(`${url}/auth/init`, {
    org: 'setup-axiom',
    name: 'setup-axiom',
    email: AxiomEmail,
    password: AxiomPassword
  });
  if (res.statusCode !== 200) {
    throw new Error(`Failed to initialize deployment`);
  }
}

async function createPersonalToken(
  client: http.HttpClient,
  url: string
): Promise<string> {
  const sessionRes = await client.post(
    `${url}/auth/signin/credentials`,
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
    `${url}/api/v1/tokens/personal`,
    {
      name: 'setup-axiom',
      description:
        'This token is automatically created by github.com/axiomhq/setup-axiom'
    },
    {cookie}
  );

  const rawToken = await client.getJson<tokens.RawToken>(
    `${url}/api/v1/tokens/personal/${tokenRes.result!.id}/token`,
    {cookie}
  );

  await client.post(`${url}/logout`, '', {cookie});

  return rawToken.result!.token;
}

async function writeDockerComposeFile(dir: string) {
  await io.mkdirP(dir);
  await fs.promises.writeFile(
    `${dir}/docker-compose.yml`,
    dockerCompose.Content
  );
}

export async function run(dir: string) {
  try {
    let version = core.getInput('axiom-version');
    const env = {
      AXIOM_VERSION: version,
      AXIOM_PORT: core.getInput('axiom-port'),
      AXIOM_LICENSE_TOKEN: core.getInput('axiom-license'),
      AXIOM_DB_IMAGE: core.getInput('axiom-db-image'),
      AXIOM_CORE_IMAGE: core.getInput('axiom-core-image')
    };

    let port = core.getInput('axiom-port');
    const url = `http://localhost:${port}`;
    core.setOutput('url', url);

    core.info(`Setting up Axiom ${version}`);

    core.info('Writing docker-compose file');
    writeDockerComposeFile(dir);

    core.startGroup('Starting stack');
    await exec.exec('docker', ['compose', 'up', '-d', '--quiet-pull'], {
      cwd: dir,
      env
    });
    core.endGroup();

    const client = new http.HttpClient('github.com/axiomhq/setup-axiom');

    core.info('Waiting until Axiom is ready');
    await waitUntilReady(client, url);

    core.info('Initializing deployment');
    await initializeDeployment(client, url);

    core.info('Creating personal token');
    const token = await createPersonalToken(client, url);
    core.setOutput('token', token);

    core.info(`Axiom is running and configured`);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}
