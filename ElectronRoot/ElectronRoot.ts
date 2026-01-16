/**
 * ElectronRoot.ts
 * 
 * Electronアプリケーションのライフサイクルを管理するルートクラス
 * 開発方針: ElectronRootには実装を書かず、インターフェース呼び出しのみ
 */

import { App } from "electron";
import { ElectronDIContainer } from "./ElectronDIContainer";

export class ElectronRoot {
    constructor(
        private _app: App,
        private _diContainer: ElectronDIContainer,
    ) {
        this.setupLifecycleHandlers();
    }

    /**
     * Electronのライフサイクルイベントハンドラーを設定
     * 各イベントは対応するクラスのexec()を呼び出すのみ
     */
    private setupLifecycleHandlers(): void {
        this._app.whenReady().then(() => this._diContainer.onWhenReady.exec());
        this._app.on('activate', () => this._diContainer.onActivate.exec());
        this._app.on('window-all-closed', () => this._diContainer.onWindowAllClosed.exec());
        this._app.on('before-quit', async () => this._diContainer.onBeforeQuit.exec());
    }
}