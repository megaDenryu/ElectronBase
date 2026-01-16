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
    }
});

// TypeScript型定義用（レンダラー側で使用）
export interface ElectronAPI {
    getAppVersion: () => Promise<string>;
    log: (message: string) => void;
}

// グローバル型拡張
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}
