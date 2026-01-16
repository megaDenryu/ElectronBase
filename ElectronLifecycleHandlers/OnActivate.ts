/**
 * OnActivate.ts
 * 
 * app.on('activate')イベントの処理を担当
 * 開発方針: 第二段階 - 具体実装
 */

import { BrowserWindow } from 'electron';
import { ElectronAppState } from '../Electron機能コンポーネント/ElectronAppState';
import { IWindowFactory } from '../ElectronInfla/MainWindowFactory';

export interface IOnActivate {
    exec(): Promise<void>;
}

export class OnActivate implements IOnActivate {
    constructor(
        private _windowFactory: IWindowFactory,
        private _appState: ElectronAppState
    ) {}

    /**
     * LV2: activate時の処理を実行
     */
    public async exec(): Promise<void> {
        await this.recreateWindowIfNeeded();
    }

    /**
     * LV1: 必要に応じてウィンドウを再作成
     */
    private async recreateWindowIfNeeded(): Promise<void> {
        if (BrowserWindow.getAllWindows().length === 0) {
            const window = await this._windowFactory.createMainWindow();
            this._appState.mainWindow = window;
        }
    }
}
