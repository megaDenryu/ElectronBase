/**
 * preload.ts
 * 
 * Electronのプリロードスクリプト
 * レンダラープロセスとメインプロセス間の安全な通信橋渡しを行う
 */

import { contextBridge, ipcRenderer } from 'electron';

// レンダラープロセスに公開するAPIを定義
contextBridge.exposeInMainWorld('electronAPI', {
    // アプリケーション情報を取得
    getAppVersion: () => {
        return ipcRenderer.invoke('get-app-version');
    },

    // ログ出力（開発用）
    log: (message: string) => {
        console.log('[Preload]', message);
    },

    // Pythonサーバーエラーリスナー登録
    onServerError: (callback: (error: string) => void) => {
        ipcRenderer.on('server-error', (_event, error: string) => {
            console.error('[Server Error]', error);
            callback(error);
        });
    },

    // Pythonサーバー準備完了リスナー登録
    onServerReady: (callback: () => void) => {
        ipcRenderer.on('server-ready', () => {
            console.log('[Server Ready] Pythonサーバー起動完了');
            callback();
        });
    },

    // Pythonサーバーログリスナー登録
    onServerLog: (callback: (log: string) => void) => {
        ipcRenderer.on('server-log', (_event, log: string) => {
            console.log('[Server Log]', log);
            callback(log);
        });
    },

    // 外部URLを開く
    openExternal: (url: string) => {
        return ipcRenderer.invoke('open-external', url);
    }
});

// TypeScript型定義用（レンダラー側で使用）
export interface ElectronAPI {
    getAppVersion: () => Promise<string>;
    log: (message: string) => void;
    onServerError: (callback: (error: string) => void) => void;
    onServerReady: (callback: () => void) => void;
    onServerLog: (callback: (log: string) => void) => void;
    openExternal: (url: string) => Promise<void>;
}

// グローバル型拡張
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
