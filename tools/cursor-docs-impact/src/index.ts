#!/usr/bin/env -S npx tsx

import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

import {Agent, CursorAgentError} from '@cursor/sdk';
import type {ModelSelection} from '@cursor/sdk';

import {getChangedFiles, getDiff, getRepoRoot, hasDocsChanges} from './git.js';
import {buildPrompt} from './prompt.js';

interface CliOptions {
    base: string;
    head: string;
    prNumber?: string;
    prUrl?: string;
    manualDescription?: string;
    outputDir: string;
}

function log(message: string): void {
    process.stderr.write(`${message}\n`);
}

function usage(): void {
    process.stdout.write(
        'Usage: npm run update -- [options]\n\n' +
            'Use the Cursor SDK to update repository-local docs for product/admin changes.\n\n' +
            'Options:\n' +
            '  --base <ref>              Base git ref (default: $BASE_REF or origin/master)\n' +
            '  --head <ref>              Head git ref (default: $HEAD_REF or HEAD)\n' +
            '  --pr-number <number>      Source pull request number\n' +
            '  --pr-url <url>            Source pull request URL\n' +
            '  --manual <description>    Manual product/admin change description\n' +
            '  --output-dir <path>       Report directory (default: .cursor-docs-impact)\n' +
            '  -h, --help                Show this help\n',
    );
}

function parseArgs(argv: string[]): CliOptions {
    const options: CliOptions = {
        base: process.env.BASE_REF ?? 'origin/master',
        head: process.env.HEAD_REF ?? 'HEAD',
        prNumber: process.env.PR_NUMBER,
        prUrl: process.env.PR_URL,
        manualDescription: process.env.MANUAL_DESCRIPTION,
        outputDir: process.env.OUTPUT_DIR ?? '.cursor-docs-impact',
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        switch (arg) {
            case '--base':
                options.base = argv[++i] ?? options.base;
                break;
            case '--head':
                options.head = argv[++i] ?? options.head;
                break;
            case '--pr-number':
                options.prNumber = argv[++i];
                break;
            case '--pr-url':
                options.prUrl = argv[++i];
                break;
            case '--manual':
                options.manualDescription = argv[++i];
                break;
            case '--output-dir':
                options.outputDir = argv[++i] ?? options.outputDir;
                break;
            case '-h':
            case '--help':
                usage();
                process.exit(0);
                break;
            default:
                log(`Unknown option: ${arg}`);
                usage();
                process.exit(2);
        }
    }

    return options;
}

function loadLocalEnv(repoRoot: string): void {
    if (process.env.CURSOR_API_KEY) {
        return;
    }

    const envPath = join(repoRoot, '.env');
    if (existsSync(envPath) && typeof process.loadEnvFile === 'function') {
        try {
            process.loadEnvFile(envPath);
        } catch {
            // The API key guard below handles missing or unreadable local env files.
        }
    }
}

function resolveModel(): ModelSelection {
    const id = process.env.CURSOR_MODEL?.trim();
    return {id: id && id.length > 0 ? id : 'gpt-5.5'};
}

function truncateDiff(diff: string, maxBytes: number): {diff: string; truncated: boolean} {
    const buffer = Buffer.from(diff, 'utf8');
    if (buffer.byteLength <= maxBytes) {
        return {diff, truncated: false};
    }
    return {diff: buffer.subarray(0, maxBytes).toString('utf8'), truncated: true};
}

function writeReport(outputDir: string, body: string): void {
    mkdirSync(outputDir, {recursive: true});
    writeFileSync(join(outputDir, 'report.md'), body);
}

async function main(): Promise<number> {
    const options = parseArgs(process.argv.slice(2));
    const repoRoot = getRepoRoot();
    loadLocalEnv(repoRoot);

    const outputDir = join(repoRoot, options.outputDir);
    const apiKey = process.env.CURSOR_API_KEY;
    if (!apiKey) {
        writeReport(outputDir, 'Cursor docs impact automation skipped because CURSOR_API_KEY is not set.');
        return 0;
    }

    const manualDescription = options.manualDescription?.trim();
    const changedFiles = getChangedFiles(repoRoot, options.base, options.head);
    if (changedFiles.length === 0 && !manualDescription) {
        writeReport(outputDir, 'No changed files or manual description were supplied. No docs changes were made.');
        return 0;
    }

    const maxDiffBytes = Number(process.env.MAX_DIFF_BYTES ?? 160000);
    const {diff, truncated} = truncateDiff(getDiff(repoRoot, options.base, options.head), maxDiffBytes);
    const prompt = buildPrompt({
        base: options.base,
        head: options.head,
        prNumber: options.prNumber,
        prUrl: options.prUrl,
        manualDescription,
        changedFiles,
        diff,
        truncated,
        maxDiffBytes,
    });

    try {
        log('Invoking Cursor documentation agent...');
        const result = await Agent.prompt(prompt, {
            apiKey,
            model: resolveModel(),
            mode: 'agent',
            local: {
                cwd: repoRoot,
                settingSources: [],
            },
        });

        if (result.status !== 'finished') {
            writeReport(outputDir, `Cursor docs impact automation ended with status "${result.status}" (run ${result.id}).`);
            return 0;
        }

        const changed = hasDocsChanges(repoRoot);
        const summary = result.result?.trim() || 'Cursor documentation agent finished without a text summary.';
        writeReport(
            outputDir,
            [
                '# Documentation impact result',
                '',
                `Source PR: ${options.prNumber ? `#${options.prNumber}` : 'not supplied'}`,
                `Docs changed: ${changed ? 'yes' : 'no'}`,
                '',
                summary,
            ].join('\n'),
        );
    } catch (err) {
        if (err instanceof CursorAgentError) {
            writeReport(
                outputDir,
                `Cursor docs impact automation could not start: ${err.message} (retryable=${err.isRetryable}).`,
            );
            return 0;
        }

        const message = err instanceof Error ? err.message : String(err);
        writeReport(outputDir, `Cursor docs impact automation failed unexpectedly: ${message}`);
        return 0;
    }

    return 0;
}

main()
    .then((code) => process.exit(code))
    .catch((err) => {
        log(`cursor-docs-impact crashed: ${err instanceof Error ? err.stack ?? err.message : String(err)}`);
        process.exit(0);
    });
