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

        // ページロード - ランチャーUIを表示
        if (isDevelopment) {
            NodeLog.print("now Development mode");
            // ✅ 開発環境: Vite開発サーバー (localhost:5173) からロード
            await window.loadURL('http://localhost:5173/html/launcher.html');
        } else {
            NodeLog.print("now Production mode");
            // ✅ 本番環境: Viteがビルドした dist/html/launcher.html をロード
            // electron-dist/main/main.js から見た相対パス: ../../dist/html/launcher.html
            await window.loadFile(path.join(__dirname, '../../dist/html/launcher.html'));
        }

        // ウィンドウが閉じられた時の処理
        window.on('closed', () => {
            // クリーンアップ処理
        });

        return window;
    }
}