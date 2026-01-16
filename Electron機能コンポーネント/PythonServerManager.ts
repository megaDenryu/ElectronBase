/**
 * PythonServerManager.ts
 * 
 * Pythonサーバーの起動・停止・状態管理を担当するクラス
 */

import { ChildProcess } from 'child_process';
import { BrowserWindow } from 'electron';

export interface IPythonServerManager {
    startServer(window: BrowserWindow | null): Promise<ChildProcess>;
    stopServer(process: ChildProcess): Promise<void>;
    isServerReady(): boolean;
    resetServerReadyFlag(): void;
}

export class PythonServerManager implements IPythonServerManager {
    private _isServerReady: boolean = false;

    constructor() {}

    /**
     * Pythonサーバーを起動
     * @param window メインウィンドウ（ログ送信用）
     * @returns Pythonプロセス
     */
    async startServer(window: BrowserWindow | null): Promise<ChildProcess> {
        this._isServerReady = false;

        // const pythonProcess = await startPythonServer(
        //     (log: string) => {
        //         // サーバーログをレンダラープロセスに送信
        //         window?.webContents.send('server-log', log);
                
        //         // サーバー起動完了を検知
        //         if (log.includes('Application startup complete') || log.includes('Uvicorn running')) {
        //             this._isServerReady = true;
        //             window?.webContents.send('server-ready');
        //         }
        //     },
        //     (error: string) => {
        //         // サーバーエラーをレンダラープロセスに送信
        //         window?.webContents.send('server-error', error);
        //     }
        // );
        const pythonProcess: ChildProcess = {} as ChildProcess; // 仮の実装
        return pythonProcess;
    }

    /**
     * Pythonサーバーを停止
     * @param process 停止するPythonプロセス
     */
    async stopServer(process: ChildProcess): Promise<void> {
        // this._isServerReady = false;
        // await stopPythonServer(process);
    }

    /**
     * サーバーが起動完了しているかどうか
     * @returns サーバー起動状態
     */
    isServerReady(): boolean {
        return this._isServerReady;
    }

    /**
     * サーバー起動完了フラグをリセット
     */
    resetServerReadyFlag(): void {
        this._isServerReady = false;
    }
}