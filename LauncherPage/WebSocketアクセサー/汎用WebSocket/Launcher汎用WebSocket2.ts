/**
 * Launcher汎用WebSocket2.ts
 * 
 * ランチャーページ用の汎用WebSocket（汎用WebSocket2ベース）
 * 
 * 責務:
 * - 汎用WebSocket2を使用した接続管理
 * - Launcher固有のメッセージ振り分け処理
 * - コールバックの管理
 */

import { 汎用WebSocket2 } from "Extend/汎用WebSocket2";
import { LauncherURLBaseInfo } from "../URLBaseInfo";
import { 
    LauncherMessage, 
    LauncherMessageType, 
    LauncherMessageSchema,
    CharacterStateListData,
    CharacterUpdatedData
} from "./LauncherMessageSchemas";

/**
 * コールバック型定義（型安全性を向上）
 */
export interface LauncherGeneralWebSocketCallbacks {
    onCharacterStateList?: (data: CharacterStateListData) => void;
    onCharacterUpdated?: (data: CharacterUpdatedData) => void;
}

/**
 * Launcher汎用WebSocket2
 * 汎用WebSocket2を使用した型安全なLauncher用WebSocket
 */
export class Launcher汎用WebSocket2 {
    private _webSocket: 汎用WebSocket2<LauncherMessage>;
    private _callbacks: LauncherGeneralWebSocketCallbacks;

    constructor(urlBase: LauncherURLBaseInfo, callbacks: LauncherGeneralWebSocketCallbacks = {}) {
        this._callbacks = callbacks;
        
        // 汎用WebSocket2にメッセージハンドラーを注入
        this._webSocket = new 汎用WebSocket2<LauncherMessage>({
            url: `ws://${urlBase.localhost}:${urlBase.port}/generalPurPoseWs/${urlBase.client_id}`,
            schema: LauncherMessageSchema,
            messageHandler: (message) => this.handleMessage(message),
            onOpen: () => console.log('Launcher汎用WebSocket2: 接続成功'),
            onClose: () => console.log('Launcher汎用WebSocket2: 接続が閉じられました'),
            onError: (error) => console.error('Launcher汎用WebSocket2: エラー', error)
        });
    }

    /**
     * コールバックを設定する（後から設定可能）
     */
    public setCallbacks(callbacks: LauncherGeneralWebSocketCallbacks): void {
        this._callbacks = { ...this._callbacks, ...callbacks };
    }

    /**
     * メッセージハンドラー（型安全な振り分け）
     * 判別可能ユニオン型により各ハンドラーで正確な型が保証される
     */
    private handleMessage(message: LauncherMessage): void {
        console.log('Launcher汎用WebSocket2: メッセージ受信', message);
        
        switch (message.type) {
            case LauncherMessageType.CharacterStateList:
                this.handleCharacterStateList(message.data);
                break;
            case LauncherMessageType.CharacterUpdated:
                this.handleCharacterUpdated(message.data);
                break;
            default:
                // TypeScriptの網羅性チェック
                const _exhaustiveCheck: never = message;
                console.warn("Launcher汎用WebSocket2: 不明なメッセージタイプ", _exhaustiveCheck);
        }
    }

    private handleCharacterStateList(data: CharacterStateListData): void {
        console.log('Launcher汎用WebSocket2: キャラクター状態リスト処理', data);
        if (this._callbacks.onCharacterStateList) {
            this._callbacks.onCharacterStateList(data);
        }
    }

    private handleCharacterUpdated(data: CharacterUpdatedData): void {
        console.log('Launcher汎用WebSocket2: キャラクター更新処理', data);
        if (this._callbacks.onCharacterUpdated) {
            this._callbacks.onCharacterUpdated(data);
        }
    }

    /**
     * WebSocket接続を閉じる
     */
    public close(): void {
        this._webSocket.close();
    }

    /**
     * 接続状態を取得
     */
    public get readyState(): number {
        return this._webSocket.readyState;
    }
}
