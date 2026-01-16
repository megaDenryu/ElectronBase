/**
 * OnWindowAllClosed.ts
 * 
 * app.on('window-all-closed')イベントの処理を担当
 * 開発方針: 第一段階 - LV2メソッドのみ実装
 */

import { App } from 'electron';

export interface IOnWindowAllClosed {
    exec(): void;
}

export class OnWindowAllClosed implements IOnWindowAllClosed {
    constructor(
        private _app: App
    ) {}

    /**
     * LV2: window-all-closed時の処理を実行
     */
    public exec(): void {
        this.quitAppIfNeeded();
    }

    /**
     * LV1: 必要に応じてアプリを終了
     */
    private quitAppIfNeeded(): void {
        // macOS以外ではアプリケーションを終了
        if (process.platform !== 'darwin') {
            this._app.quit();
        }
    }
}
