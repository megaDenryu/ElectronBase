/**
 * IpcHandlerImpl.ts
 * 
 * IPC通信のハンドラーを管理するクラス
 * レンダラープロセスとメインプロセス間の通信を仲介
 */

import { ipcMain, shell, BrowserWindow } from 'electron';
import { IPythonServerManager } from './PythonServerManager';
import { ChildProcess } from 'child_process';

export interface IIpcHandler {
    setupHandlers(
        window: BrowserWindow | null,
        pythonServerProcess: ChildProcess | null,
        onServerProcessUpdate: (process: ChildProcess | null) => void
    ): void;
    removeAllHandlers(): void;
}

export class IpcHandlerImpl implements IIpcHandler {
    private _serverManager: IPythonServerManager;
    private _registeredChannels: string[] = [];

    constructor(serverManager: IPythonServerManager) {
        this._serverManager = serverManager;
    }

    /**
     * IPC通信のハンドラーを設定
     * @param window メインウィンドウ
     * @param pythonServerProcess 現在のPythonプロセス
     * @param onServerProcessUpdate プロセス更新時のコールバック
     */
    setupHandlers(
        window: BrowserWindow | null,
        pythonServerProcess: ChildProcess | null,
        onServerProcessUpdate: (process: ChildProcess | null) => void
    ): void {
        // サーバーステータス確認
        this.registerHandle('check-server-status', () => {
            return this._serverManager.isServerReady();
        });

        // Pythonサーバーの再起動
        this.registerHandle('restart-python-server', async () => {
            if (pythonServerProcess) {
                await this._serverManager.stopServer(pythonServerProcess);
            }
            this._serverManager.resetServerReadyFlag();
            
            const newProcess = await this._serverManager.startServer(window);
            onServerProcessUpdate(newProcess);
        });

        // 外部URLをブラウザで開く
        this.registerHandle('open-external', async (_event, url: string) => {
            await shell.openExternal(url);
        });

        // アプリケーション終了
        this.registerOn('quit-app', () => {
            // アプリケーション終了はElectronRootで管理
            // ここでは何もしない（または終了リクエストイベントを発火）
        });
    }

    /**
     * ハンドラーを登録（handle形式）
     */
    private registerHandle(channel: string, handler: (...args: any[]) => any): void {
        ipcMain.handle(channel, handler);
        this._registeredChannels.push(channel);
    }

    /**
     * ハンドラーを登録（on形式）
     */
    private registerOn(channel: string, handler: (...args: any[]) => void): void {
        ipcMain.on(channel, handler);
        this._registeredChannels.push(channel);
    }

    /**
     * 登録したすべてのハンドラーを削除
     */
    removeAllHandlers(): void {
        for (const channel of this._registeredChannels) {
            ipcMain.removeHandler(channel);
            ipcMain.removeAllListeners(channel);
        }
        this._registeredChannels = [];
    }
}