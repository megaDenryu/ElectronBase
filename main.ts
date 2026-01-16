/**
 * main_electron.ts
 * 
 * Electronアプリケーションのエントリーポイント
 * DIコンテナを使用して依存関係を解決し、ElectronRootを起動
 */

import { app } from 'electron';
import { ElectronRoot } from './ElectronRoot/ElectronRoot';
import { ElectronDIContainer } from './ElectronRoot/ElectronDIContainer';

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

// コンソール出力の文字化け対策として、元のログ関数をラップ
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args: any[]) => {
    originalLog(...args.map(arg =>
        typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)
    ));
};

console.error = (...args: any[]) => {
    originalError(...args.map(arg =>
        typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)
    ));
};

console.warn = (...args: any[]) => {
    originalWarn(...args.map(arg =>
        typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)
    ));
};

// DIコンテナで依存関係を解決
const diContainer = new ElectronDIContainer();

// ElectronRootを起動（ライフサイクル管理のみを担当）
new ElectronRoot(app, diContainer);