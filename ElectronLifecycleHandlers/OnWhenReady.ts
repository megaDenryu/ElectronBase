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

/**
 * 開発時のサーバー起動モード
 * - 'exe': dist/main/main.exe を使用（PyInstallerビルド後）
 * - 'uvicorn': uvicorn コマンドを使用（ビルドなしで即座に起動）
 */
export type PythonServer起動モード = { isDev: false } | { isDev: true, mode: 'exe' | 'uvicorn' | 'none' }
export const pythonServer起動モード: PythonServer起動モード = { isDev: true, mode: 'uvicorn' };

export class OnWhenReady implements IOnWhenReady {
    private _pythonProcess: ChildProcess | null = null;
    constructor(
        private _windowFactory: IWindowFactory,
        private _serverManager: IPythonServerManager,
        private _ipcHandler: IIpcHandler,
        private _globalShortcutManager: IGlobalShortcutManager,
        private _appState: ElectronAppState,
    ) { }

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
        if ((pythonServer起動モード.isDev == true && pythonServer起動モード.mode == 'none') == false) {
            await this.startPythonServer(pythonServer起動モード);
        }
        await this.createMainWindow();
        this.registerGlobalShortcuts();
    }

    /**
     * LV1: IPC通信ハンドラーをセットアップ (具体実装は第二段階で)
     */
    private setupIpcHandlers(): void {
        this._ipcHandler.setupHandlers(
            this._appState.mainWindow,
            this._appState.pythonServerProcess,
            (process) => {
                this._appState.pythonServerProcess = process;
            }
        );
    }

    /**
     * LV1: Pythonサーバーを起動
     */
    private async startPythonServer(mode: PythonServer起動モード): Promise<void> {
        try {
            console.log('[OnWhenReady] Pythonサーバー起動処理を開始');
            this._pythonProcess = await this._serverManager.startServer(this._appState.mainWindow, mode);
            this._appState.pythonServerProcess = this._pythonProcess;
            console.log('[OnWhenReady] Pythonサーバー起動完了');
        } catch (error) {
            console.error('[OnWhenReady] Pythonサーバー起動エラー:', error);
            // エラーが発生してもアプリケーションは継続（Pythonなしでも動作する仕様を想定）
        }
    }

    private startPythonServerInBackground(mode: PythonServer起動モード): void {
        this._serverManager.startServer(this._appState.mainWindow, mode)
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
