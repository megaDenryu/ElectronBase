/**
 * PythonServerManager.ts
 * 
 * Pythonサーバーの起動・停止・状態管理を担当するクラス
 */

import { spawn, ChildProcess } from 'child_process';
import { BrowserWindow } from 'electron';
import { app } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// ESMで__dirnameの代替を定義
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 開発時のサーバー起動モード
 * - 'exe': dist/main/main.exe を使用（PyInstallerビルド後）
 * - 'uvicorn': uvicorn コマンドを使用（ビルドなしで即座に起動）
 */
type 開発サーバー起動モード = 'exe' | 'uvicorn';

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
    
    /** 開発時のサーバー起動モード設定 */
    private readonly 開発モード: 開発サーバー起動モード = 'uvicorn';

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
                const isDev = !app.isPackaged;
                const projectRoot = this.getProjectRoot();
                
                let pythonProcess: ChildProcess;
                
                // if (isDev && this.開発モード === 'uvicorn') {
                if (false) {
                    // 開発時: uvicorn コマンドを使用（本番に近い形で起動）
                    console.log(`[PythonServerManager] Pythonサーバーを起動開始（uvicornモード）`);
                    console.log(`[PythonServerManager] プロジェクトルート: ${projectRoot}`);
                    
                    // localenv の python を使用して uvicorn を実行
                    const pythonExe = path.join(projectRoot, 'localenv', 'Scripts', 'python.exe');
                    const uvicornArgs = ['-m', 'uvicorn', 'main:app', '--port=8010', '--host=0.0.0.0', '--lifespan', 'on'];
                    
                    console.log(`[PythonServerManager] 実行コマンド: ${pythonExe} ${uvicornArgs.join(' ')}`);
                    
                    pythonProcess = spawn(pythonExe, uvicornArgs, {
                        cwd: projectRoot,
                        stdio: ['ignore', 'pipe', 'pipe'],
                        detached: false
                    });
                } else {
                    // 本番時 または 開発時exeモード: main.exe を使用
                    const pythonPath = this.getPythonPath();
                    console.log(`[PythonServerManager] Pythonサーバーを起動開始（exeモード）`);
                    console.log(`[PythonServerManager] Pythonパス: ${pythonPath}`);
                    
                    pythonProcess = spawn(pythonPath, [], {
                        cwd: projectRoot,
                        stdio: ['ignore', 'pipe', 'pipe'],
                        detached: false
                    });
                }

                this._pythonProcess = pythonProcess;

                // タイムアウト処理
                const timeoutHandle = setTimeout(() => {
                    console.warn(`[PythonServerManager] サーバー起動がタイムアウト（${this.SERVER_START_TIMEOUT}ms）`);
                    this._isServerReady = true; // 時間経過で強制的に準備完了と見なす
                    resolve(pythonProcess);
                }, this.SERVER_START_TIMEOUT);

                // サーバー起動完了を検知する共通ロジック
                const サーバー起動完了を検知 = (log: string): void => {
                    if (this._isServerReady) return;
                    if (
                        log.includes('Application startup complete') ||
                        log.includes('Uvicorn running')
                    ) {
                        console.log(`[PythonServerManager] Pythonサーバー起動完了を検知`);
                        this._isServerReady = true;
                        window?.webContents.send('server-ready');
                        clearTimeout(timeoutHandle);
                        resolve(pythonProcess);
                    }
                };

                // stdout を監視してサーバー起動完了を検知
                pythonProcess.stdout?.on('data', (data: Buffer) => {
                    const log = data.toString().trim();
                    if (log) {
                        console.log(`[PythonServer] ${log}`);
                        window?.webContents.send('server-log', log);
                        サーバー起動完了を検知(log);
                    }
                });

                // stderr を監視（Uvicorn は INFO ログを stderr に出力する）
                pythonProcess.stderr?.on('data', (data: Buffer) => {
                    const log = data.toString().trim();
                    if (log) {
                        console.error(`[PythonServer Error] ${log}`);
                        window?.webContents.send('server-error', log);
                        サーバー起動完了を検知(log);
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
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorStack = error instanceof Error ? error.stack : '';
                console.error(`[PythonServerManager] 予期しないエラー: ${errorMessage}`);
                console.error(`[PythonServerManager] スタック: ${errorStack}`);
                window?.webContents.send('server-error', `サーバー起動エラー: ${errorMessage}`);
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
        const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

        if (isDev) {
            // VoiroStudio\RefucteringVoiroStudio\dist\main\main.exe　を直接指定する。
            const projectRoot = this.getProjectRoot();
            return path.join(projectRoot, 'dist', 'main', 'main.exe');
        } else {
            // 本番時：portable/nsis両方対応
            // app.getAppPath() は resources/app.asar のパスを返す
            // その親の親ディレクトリ(アプリルート)にある resources/python/main.exe を参照
            // 例: C:\...\VoiroStudio\resources\app.asar → C:\...\VoiroStudio\resources\python\main.exe
            const resourcesDir = path.dirname(app.getAppPath()); // = .../resources
            return path.join(resourcesDir, 'python', 'main.exe');
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