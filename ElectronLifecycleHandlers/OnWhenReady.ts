/**
 * OnWhenReady.ts
 * 
 * app.whenReady()イベントの処理を担当
 * 開発方針: Pythonサーバー起動を実装
 */

import { IPythonServerManager } from '../Electron機能コンポーネント/PythonServerManager';
import { IIpcHandler } from '../Electron機能コンポーネント/IpcHandlerImpl';
import { IGlobalShortcutManager } from '../Electron機能コンポーネント/GlobalShortcutManager';
import { ElectronAppState } from '../Electron機能コンポーネント/ElectronAppState';
import { IWindowFactory } from '../ElectronInfla/MainWindowFactory';
import { ChildProcess } from 'child_process';

export interface IOnWhenReady {
    exec(): Promise<void>;
}

export class OnWhenReady implements IOnWhenReady {
    private _pythonProcess: ChildProcess | null = null;

    constructor(
        private _windowFactory: IWindowFactory,
        private _serverManager: IPythonServerManager,
        private _ipcHandler: IIpcHandler,
        private _globalShortcutManager: IGlobalShortcutManager,
        private _appState: ElectronAppState
    ) {}

    /**
     * LV2: app.whenReady()時の処理を実行
     */
    public async exec(): Promise<void> {
        await this.initializeApp();
    }

    /**
     * LV2: アプリケーション初期化
     */
    private async initializeApp(): Promise<void> {
        this.setupIpcHandlers();
        await this.startPythonServer();
        await this.createMainWindow();
        // this.startPythonServerInBackground();
        this.registerGlobalShortcuts();
    }

    /**
     * LV1: IPC通信ハンドラーをセットアップ (具体実装は第二段階で)
     */
    private setupIpcHandlers(): void {
        // 第二段階で実装
    }

    /**
     * LV1: Pythonサーバーを起動
     */
    private async startPythonServer(): Promise<void> {
        try {
            console.log('[OnWhenReady] Pythonサーバー起動処理を開始');
            this._pythonProcess = await this._serverManager.startServer(this._appState.mainWindow);
            this._appState.pythonServerProcess = this._pythonProcess;
            console.log('[OnWhenReady] Pythonサーバー起動完了');
        } catch (error) {
            console.error('[OnWhenReady] Pythonサーバー起動エラー:', error);
            // エラーが発生してもアプリケーションは継続（Pythonなしでも動作する仕様を想定）
        }
    }

    private startPythonServerInBackground(): void {
        this._serverManager.startServer(this._appState.mainWindow)
            .then(process => {
                this._appState.pythonServerProcess = process;
            })
            .catch(error => {
                console.error('[OnWhenReady] Pythonサーバー起動エラー:', error);
            });
    }

    /**
     * LV1: メインウィンドウを作成
     */
    private async createMainWindow(): Promise<void> {
        const window = await this._windowFactory.createMainWindow();
        this._appState.mainWindow = window;
    }

    /**
     * LV1: グローバルショートカットを登録
     */
    private registerGlobalShortcuts(): void {
        this._globalShortcutManager.registerShortcuts();
    }
}
