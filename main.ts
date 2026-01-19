/**
 * main_electron.ts
 * 
 * Electronアプリケーションのエントリーポイント
 * DIコンテナを使用して依存関係を解決し、ElectronRootを起動
 */

import { app } from 'electron';
import { ElectronRoot } from './ElectronRoot/ElectronRoot';
import { ElectronDIContainer } from './ElectronRoot/ElectronDIContainer';
import * as fs from 'fs';
import * as path from 'path';

// ログファイルのセットアップ
const logsDir = path.join(app.getPath('userData'), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, `app-${new Date().getTime()}.log`);
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// ログ出力関数
function writeLog(level: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)
    ).join(' ');
    const logLine = `[${timestamp}] [${level}] ${message}\n`;
    logStream.write(logLine);
    process.stdout.write(logLine);
}

// Windows環境でのコンソール文字化け対策
if (process.platform === 'win32') {
    // stdout/stderrのエンコーディングをUTF-8に設定
    if (process.stdout.setEncoding) {
        process.stdout.setEncoding('utf8');
    }
    if (process.stderr.setEncoding) {
        process.stderr.setEncoding('utf8');
    }
}

// コンソール出力をファイルに記録
console.log = (...args: any[]) => {
    writeLog('INFO', ...args);
};

console.error = (...args: any[]) => {
    writeLog('ERROR', ...args);
};

console.warn = (...args: any[]) => {
    writeLog('WARN', ...args);
};

// 未処理の例外をログに記録
process.on('uncaughtException', (error) => {
    writeLog('UNCAUGHT_EXCEPTION', error.stack || error.message);
});

writeLog('INFO', `Electron app starting... Log file: ${logFilePath}`);

// DIコンテナで依存関係を解決
const diContainer = new ElectronDIContainer();

// ElectronRootを起動（ライフサイクル管理のみを担当）
new ElectronRoot(app, diContainer);