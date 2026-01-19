/**
 * MainWindowFactory.ts
 * 
 * BrowserWindowの生成を担当するファクトリークラス
 */

import { BrowserWindow, app } from "electron";
import path from 'path';
import { fileURLToPath } from 'url';
import { IPythonServerManager } from "../Electron機能コンポーネント/PythonServerManager";
import { IIpcHandler } from "../Electron機能コンポーネント/IpcHandlerImpl";
import { NodeLog } from "TypeScriptBenriKakuchou/DebugLogForNode";

// ESMで__dirnameの代替を定義
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pythonTestMode = { development: true , pytonTestMode: true };
const webUITestMode = { development: true , pytonTestMode: false };
const 本番mode = { development: false };
type 実行モードType = { development: true; pytonTestMode: boolean } | { development: false };

export interface IWindowFactory {
    createMainWindow(): Promise<BrowserWindow>;
}

export class MainWindowFactory implements IWindowFactory {
    constructor(
        private _serverManager: IPythonServerManager,
        private _ipcHandler: IIpcHandler
    ) {}

    async createMainWindow(): Promise<BrowserWindow> {
        // ✅ 開発環境の判定: パッケージされていない = 開発環境
        const isDevelopment = !app.isPackaged; //ここでappを使うのは違法行為だが横着する。
        
        const window = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                // ✅ プリロードスクリプトのパス: Viteがelectron-dist/preloadに出力
                // electron-dist/main/main.js から見て ../preload/preload.js
                preload: path.join(__dirname, '../preload/preload.js'),
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: false,
                // 開発時もセキュリティを有効にし、必要に応じてCORSはサーバー側で対応
                webSecurity: true
            }
        });

        // 開発者ツールを開く（開発環境のみ）
        if (isDevelopment) {
            window.webContents.openDevTools();
        }

        // IPC通信のハンドラー設定(プロセス管理のコールバックが必要)
        // ※ 実際の実装では、ElectronRootから参照を受け取る形にするか、
        // または、IpcHandlerに別の設計を適用する必要がある
        

        const 実行モード: 実行モードType = { development: isDevelopment, pytonTestMode: true };

        // ページロード - ランチャーUIを表示
        if (実行モード.development === true) {
            if (実行モード.pytonTestMode === true) {
                //　viteの開発ターミナルのスレッド内でpythonサーバーを立ち上げるときの処理
                // 実行場所(app-ts)からC:\Users\pokr301qup\python_dev\VoiroStudio\RefucteringVoiroStudio\dist\main\_internal\app-ts\dist\html\launcher.htmlを指定する。
                //これは開発環境でpythonサーバーを直接起動するためのテストモードなので他にもLauncher.htmlはこのリポジトリ内に複数あるが他の物を指定しても意味がないので修正不可。
                // app.getAppPath() は app-ts ディレクトリを指すので、親ディレクトリに移動してから dist/main/_internal へ
                NodeLog.print(`now Python Test mode : appPath=${app.getAppPath()} `);
                const launcherPath = path.join(app.getAppPath(), '../dist/main/_internal/app-ts/dist/html/launcher.html');
                NodeLog.print(`Loading launcher from: ${launcherPath}`);
                await window.loadFile(launcherPath);
            }else {
                NodeLog.print("now Development mode");
                // ✅ 開発環境: Vite開発サーバー (localhost:5173) からロード
                await window.loadURL('http://localhost:5173/html/launcher.html');
            }
        } else {
            NodeLog.print("now Production mode");
            // ✅ 本番環境: app.asar 内のリソースから dist/html/launcher.html をロード
            // app.getAppPath() は release/win-unpacked/resources/app.asar のルートを指す
            const launcherPath = path.join(app.getAppPath(), 'dist/html/launcher.html');
            NodeLog.print(`Loading launcher from: ${launcherPath}`);
            await window.loadFile(launcherPath);
        }

        // ウィンドウが閉じられた時の処理
        window.on('closed', () => {
            // クリーンアップ処理
        });

        return window;
    }
}