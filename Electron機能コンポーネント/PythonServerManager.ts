/**
 * PythonServerManager.ts
 * 
 * Pythonサーバーの起動・停止・状態管理を担当するクラス
 */

import { spawn, ChildProcess } from 'child_process';
import { BrowserWindow } from 'electron';
import { app } from 'electron';
import path from 'path';

export interface IPythonServerManager {
    startServer(window: BrowserWindow | null): Promise<ChildProcess>;
    stopServer(process: ChildProcess): Promise<void>;
    isServerReady(): boolean;
    resetServerReadyFlag(): void;
}

export class PythonServerManager implements IPythonServerManager {
    private _isServerReady: boolean = false;
    private _pythonProcess: ChildProcess | null = null;
    private readonly PYTHON_PORT = 8010;
    private readonly SERVER_START_TIMEOUT = 30000; // 30秒

    constructor() {}

    /**
     * Pythonサーバーを起動
     * @param window メインウィンドウ（ログ送信用）
     * @returns Pythonプロセス
     */
    async startServer(window: BrowserWindow | null): Promise<ChildProcess> {
        this._isServerReady = false;

        return new Promise((resolve, reject) => {
            try {
                // Pythonの実行ファイルパスを決定（開発時/本番時）
                const pythonPath = this.getPythonPath();
                const mainPyPath = this.getMainPyPath();

                console.log(`[PythonServerManager] Pythonサーバーを起動開始`);
                console.log(`[PythonServerManager] Pythonパス: ${pythonPath}`);
                console.log(`[PythonServerManager] Main.pyパス: ${mainPyPath}`);

                // Pythonプロセスを生成
                const pythonProcess = spawn(pythonPath, [mainPyPath], {
                    cwd: this.getProjectRoot(),
                    stdio: ['ignore', 'pipe', 'pipe'],
                    detached: false
                });

                this._pythonProcess = pythonProcess;

                // タイムアウト処理
                const timeoutHandle = setTimeout(() => {
                    console.warn(`[PythonServerManager] サーバー起動がタイムアウト（${this.SERVER_START_TIMEOUT}ms）`);
                    this._isServerReady = true; // 時間経過で強制的に準備完了と見なす
                    resolve(pythonProcess);
                }, this.SERVER_START_TIMEOUT);

                // stdout を監視してサーバー起動完了を検知
                pythonProcess.stdout?.on('data', (data: Buffer) => {
                    const log = data.toString().trim();
                    if (log) {
                        console.log(`[PythonServer] ${log}`);
                        window?.webContents.send('server-log', log);

                        // サーバー起動完了パターンを複数設定
                        if (
                            log.includes('Application startup complete') ||
                            log.includes('Uvicorn running') ||
                            log.includes('Running on') ||
                            log.includes('WARNING') // FastAPIの起動ログ
                        ) {
                            if (!this._isServerReady) {
                                console.log(`[PythonServerManager] Pythonサーバー起動完了を検知`);
                                this._isServerReady = true;
                                window?.webContents.send('server-ready');
                                clearTimeout(timeoutHandle);
                                resolve(pythonProcess);
                            }
                        }
                    }
                });

                // stderr を監視
                pythonProcess.stderr?.on('data', (data: Buffer) => {
                    const error = data.toString().trim();
                    if (error) {
                        console.error(`[PythonServer Error] ${error}`);
                        window?.webContents.send('server-error', error);
                    }
                });

                // プロセス終了イベント
                pythonProcess.on('exit', (code: number | null, signal: string | null) => {
                    console.log(`[PythonServerManager] Pythonプロセス終了 (コード: ${code}, シグナル: ${signal})`);
                    this._isServerReady = false;
                    this._pythonProcess = null;
                });

                // プロセスエラーイベント
                pythonProcess.on('error', (err: Error) => {
                    console.error(`[PythonServerManager] プロセスエラー: ${err.message}`);
                    window?.webContents.send('server-error', `プロセス起動エラー: ${err.message}`);
                    clearTimeout(timeoutHandle);
                    reject(err);
                });

            } catch (error) {
                console.error(`[PythonServerManager] 予期しないエラー:`, error);
                reject(error);
            }
        });
    }

    /**
     * Pythonサーバーを停止
     * @param process 停止するPythonプロセス
     */
    async stopServer(process: ChildProcess): Promise<void> {
        this._isServerReady = false;

        if (!process) {
            console.warn(`[PythonServerManager] プロセスが存在しません`);
            return;
        }

        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.warn(`[PythonServerManager] プロセス終了タイムアウト、強制終了します`);
                try {
                    process.kill('SIGKILL');
                } catch (e) {
                    console.error(`[PythonServerManager] プロセス強制終了エラー:`, e);
                }
                resolve();
            }, 5000);

            process.on('exit', () => {
                clearTimeout(timeout);
                console.log(`[PythonServerManager] Pythonサーバー停止完了`);
                resolve();
            });

            // プロセス終了を試みる
            try {
                if (process.pid) {
                    process.kill('SIGTERM');
                    console.log(`[PythonServerManager] SIGTERM送信完了 (PID: ${process.pid})`);
                }
            } catch (e) {
                console.error(`[PythonServerManager] プロセス終了エラー:`, e);
                resolve();
            }
        });
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

    /**
     * Pythonの実行ファイルパスを取得
     * 開発時: python、本番時: main.exe
     */
    private getPythonPath(): string {
        // 本番環境ではapp.getAppPath()の相対パスで.exeを参照
        const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

        if (isDev) {
            // 開発時はシステムのpythonコマンドを使用
            return process.platform === 'win32' ? 'python' : 'python3';
        } else {
            // 本番時はEXEファイル内のmain.exeを参照
            return path.join(app.getAppPath(), '..', 'main.exe');
        }
    }

    /**
     * main.py のパスを取得
     */
    private getMainPyPath(): string {
        const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

        if (isDev) {
            // 開発時：プロジェクトルートのmain.py
            return path.join(this.getProjectRoot(), 'main.py');
        } else {
            // 本番時はmain.exeが直接実行されるため不要
            // ただしフォールバック用に記載
            return path.join(this.getProjectRoot(), 'main.py');
        }
    }

    /**
     * プロジェクトルートを取得
     */
    private getProjectRoot(): string {
        const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

        if (isDev) {
            // 開発時：electron-dist/main/main.jsの場所から遡る
            // __dirname は electron-dist/main
            return path.join(__dirname, '..', '..', '..');
        } else {
            // 本番時：アプリケーション全体のルート
            return path.join(app.getAppPath(), '..');
        }
    }
}