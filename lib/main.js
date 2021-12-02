"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const http = __importStar(require("@actions/http-client"));
const AxiomUrl = 'http://localhost:8080';
const sleep = (ms) => {
    return new Promise((resolve, _reject) => setTimeout(resolve, ms));
};
function startStack(version) {
    return __awaiter(this, void 0, void 0, function* () {
        core.startGroup('docker compose up -d');
        yield exec.exec('docker', ['compose', 'up', '-d', '--quiet-pull'], {
            env: {
                AXIOM_VERSION: version
            }
        });
        core.endGroup();
    });
}
function waitUntilReady(client) {
    return __awaiter(this, void 0, void 0, function* () {
        core.info('Waiting until Axiom is ready');
        for (let i = 0; i < 10; i++) {
            try {
                yield client.get(AxiomUrl);
                break; // Reachable
            }
            catch (error) {
                yield sleep(1000);
            }
        }
    });
}
function initializeDeployment(client) {
    return __awaiter(this, void 0, void 0, function* () {
        core.info('Initializing deployment');
        const res = yield client.postJson(`${AxiomUrl}/auth/init`, {
            org: 'setup-axiom',
            name: 'setup-axiom',
            email: 'info@axiom.co',
            password: 'setup-axiom'
        });
        if (res.statusCode !== 200) {
            throw new Error(`Failed to initialize deployment`);
        }
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let version = core.getInput('axiom-version');
            const client = new http.HttpClient('github.com/axiomhq/setup-axiom');
            core.info(`Starting Axiom ${version} stack`);
            yield startStack(version);
            yield waitUntilReady(client);
            yield initializeDeployment(client);
            core.info(`Axiom stack started and configured`);
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
exports.run = run;
