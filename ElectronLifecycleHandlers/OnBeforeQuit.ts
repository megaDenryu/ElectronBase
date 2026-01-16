/**
 * OnBeforeQuit.ts
 * 
 * app.on('before-quit')イベントの処理を担当
 * 開発方針: 第一段階 - LV2メソッドのみ実装
 */

import { IPythonServerManager } from '../Electron機能コンポーネント/PythonServerManager';
import { IGlobalShortcutManager } from '../Electron機能コンポーネント/GlobalShortcutManager';
import { ElectronAppState } from '../Electron機能コンポーネント/ElectronAppState';

export interface IOnBeforeQuit {
    exec(): Promise<void>;
}

export class OnBeforeQuit implements IOnBeforeQuit {
    constructor(
        private _serverManager: IPythonServerManager,
        private _globalShortcutManager: IGlobalShortcutManager,
        private _appState: ElectronAppState
    ) {}

    /**
     * LV2: before-quit時の処理を実行
     */
    public async exec(): Promise<void> {
        await this.cleanup();
    }

    /**
     * LV2: クリーンアップ処理
     */
    private async cleanup(): Promise<void> {
        this.unregisterGlobalShortcuts();
        await this.stopPythonServer();
    }

    /**
     * LV1: グローバルショートカットを解除
     */
    private unregisterGlobalShortcuts(): void {
        this._globalShortcutManager.unregisterAllShortcuts();
    }

    /**
     * LV1: Pythonサーバーを停止
     */
    private async stopPythonServer(): Promise<void> {
        if (this._appState.hasServerProcess() && this._appState.pythonServerProcess) {
            await this._serverManager.stopServer(this._appState.pythonServerProcess);
            this._appState.pythonServerProcess = null;
        }
    }
}
