/**
 * ServerConfigManager.ts
 * 
 * サーバー設定（主にポート番号）の保存と読み込みを管理する
 * Python側の AppSettingJson/app_settings.json を直接参照する
 */

import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ESMで__dirnameの代替を定義
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface IServerConfigManager {
    getPort(): number;
    setPort(port: number): void;
}

interface AppSettings {
    serverPort?: number;
    // 他のフィールドは維持するため any で受ける
    [key: string]: any;
}

export class ServerConfigManager implements IServerConfigManager {
    private _configPath: string;

    constructor() {
        this._configPath = this.getAppSettingsPath();
        console.log(`[ServerConfigManager] 設定ファイルパス: ${this._configPath}`);
    }

    /**
     * 設定ファイルのパスを取得
     */
    private getAppSettingsPath(): string {
        const isDev = !app.isPackaged;
        let projectRoot: string;

        if (isDev) {
            // 開発時：electron-dist/main/main.js (バンドル後) から遡る
            // VoiroStudio/RefucteringVoiroStudio/app-ts/electron-dist/main -> .../RefucteringVoiroStudio
            projectRoot = path.join(__dirname, '..', '..', '..');
        } else {
            // 本番時：resourcesフォルダの親（アプリルート）
            projectRoot = path.join(app.getAppPath(), '..');
        }

        let configPath: string;
        if (isDev) {
            configPath = path.join(projectRoot, 'api', 'AppSettingJson', 'app_settings.json');
        } else {
            // resources/python/api/AppSettingJson/app_settings.json
            const resourcesDir = path.dirname(app.getAppPath());
            configPath = path.join(resourcesDir, 'python', 'api', 'AppSettingJson', 'app_settings.json');

            // フォールバック: _internal の中にあるケース
            if (!fs.existsSync(configPath)) {
                const internalPath = path.join(resourcesDir, 'python', '_internal', 'api', 'AppSettingJson', 'app_settings.json');
                if (fs.existsSync(internalPath)) {
                    configPath = internalPath;
                }
            }
        }

        return configPath;
    }

    /**
     * ポート番号を取得
     */
    public getPort(): number {
        try {
            if (fs.existsSync(this._configPath)) {
                const configData = fs.readFileSync(this._configPath, 'utf-8');
                const config: AppSettings = JSON.parse(configData);
                if (config.serverPort && !isNaN(config.serverPort)) {
                    return config.serverPort;
                }
            }
        } catch (error) {
            console.error('[ServerConfigManager] 設定読み込みエラー:', error);
        }

        // デフォルト値
        return this.getDefaultPort();
    }

    /**
     * ポート番号を保存
     */
    public setPort(port: number): void {
        try {
            let config: AppSettings = {};

            // 既存の設定があれば読み込む
            if (fs.existsSync(this._configPath)) {
                try {
                    const existingData = fs.readFileSync(this._configPath, 'utf-8');
                    config = JSON.parse(existingData);
                } catch (e) {
                    console.warn('[ServerConfigManager] 既存設定の読み込みに失敗、新規作成します');
                }
            } else {
                // ディレクトリが存在しない場合は作成する
                const dir = path.dirname(this._configPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
            }

            // ポートを更新
            config.serverPort = port;

            fs.writeFileSync(this._configPath, JSON.stringify(config, null, 4), 'utf-8');
            console.log(`[ServerConfigManager] ポート設定を保存しました: ${port}`);
        } catch (error) {
            console.error('[ServerConfigManager] 設定保存エラー:', error);
            throw error;
        }
    }

    /**
     * 環境に応じたデフォルトポートを取得
     */
    private getDefaultPort(): number {
        // 全環境でデフォルトは8022
        return 8022;
    }
}
