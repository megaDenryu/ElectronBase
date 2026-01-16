/**
 * OnWhenReady.ts
 * 
 * app.whenReady()イベントの処理を担当
 * 開発方針: 第一段階 - LV2メソッドのみ実装
 */

import { IPythonServerManager } from '../Electron機能コンポーネント/PythonServerManager';
import { IIpcHandler } from '../Electron機能コンポーネント/IpcHandlerImpl';
import { IGlobalShortcutManager } from '../Electron機能コンポーネント/GlobalShortcutManager';
import { ElectronAppState } from '../Electron機能コンポーネント/ElectronAppState';
import { IWindowFactory } from '../ElectronInfla/MainWindowFactory';

export interface IOnWhenReady {
    exec(): Promise<void>;
}

export class OnWhenReady implements IOnWhenReady {
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
        this.registerGlobalShortcuts();
    }

    /**
     * LV1: IPC通信ハンドラーをセットアップ (具体実装は第二段階で)
     */
    private setupIpcHandlers(): void {
        // 第二段階で実装
    }

    /**
     * LV1: Pythonサーバーを起動 (具体実装は第二段階で)
     */
    private async startPythonServer(): Promise<void> {
        // 第二段階で実装
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
