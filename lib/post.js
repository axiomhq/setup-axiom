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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const exec_1 = require("@actions/exec");
const gte_1 = __importDefault(require("semver/functions/gte"));
function run(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const version = core.getInput('axiom-version');
            const env = {
                AXIOM_VERSION: version,
                // Starting with 1.21.0, DB exposes 8080 instead of 80
                AXIOM_DB_PORT: (0, gte_1.default)(version, '1.21.0') ? '8080' : '80',
                AXIOM_PORT: core.getInput('axiom-port'),
                AXIOM_LICENSE_TOKEN: core.getInput('axiom-license'),
                AXIOM_DB_IMAGE: core.getInput('axiom-db-image'),
                AXIOM_CORE_IMAGE: core.getInput('axiom-core-image')
            };
            core.startGroup('axiom-core logs');
            yield (0, exec_1.exec)('docker', ['compose', 'logs', 'axiom-core'], { cwd: dir, env });
            core.endGroup();
            core.startGroup('axiom-db logs');
            yield (0, exec_1.exec)('docker', ['compose', 'logs', 'axiom-db'], { cwd: dir, env });
            core.endGroup();
            core.startGroup('Stopping Axiom stack');
            yield (0, exec_1.exec)('docker', ['compose', 'down', '-v'], { cwd: dir, env });
            core.endGroup();
        }
        catch (error) {
            core.warning(error.message);
        }
    });
}
exports.run = run;
