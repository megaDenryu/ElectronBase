/**
 * LauncherMessageProcessor.ts
 * 
 * ランチャーページ用のメッセージプロセッサー
 * AppVoiroStudioのMessageProcessor2に対応
 * 
 * 責務:
 * - 会話用WebSocketから受信したメッセージのキューイング
 * - メッセージの順次非同期処理
 * 
 */

import { ILauncherMessageProcessor } from "./ILauncherMessageProcessor";

export interface LauncherMessageProcessorSeed {
    // 会話用WebSocket向けのコールバック（将来実装）
}

export class LauncherMessageProcessor implements ILauncherMessageProcessor {
    private _messageQueue: MessageEvent[];
    private _isProcessing: boolean;
    private _seed: LauncherMessageProcessorSeed;

    constructor(seed: LauncherMessageProcessorSeed) {
        this._seed = seed;
        this._messageQueue = [];
        this._isProcessing = false;
    }

    public onMessage(event: MessageEvent): void {
        this._messageQueue.push(event);
        this.processMessages();
    }

    private async processMessages(): Promise<void> {
        console.log("LauncherMessageProcessor: processMessages()を呼び出しました、isProcessing=", this._isProcessing);
        
        if (this._isProcessing) {
            console.log("LauncherMessageProcessor: 処理中なので何もしない");
            return;
        }
        
        if (this._messageQueue.length === 0) {
            console.log("LauncherMessageProcessor: キューが空なので何もしない");
            return;
        }

        this._isProcessing = true;
        const event = this._messageQueue.shift();
        
        if (event) {
            await this.processMessage(event);
        }
        
        this._isProcessing = false;
        console.log("LauncherMessageProcessor: 次のprocessMessages()を呼び出します");
        this.processMessages();
    }

    private async processMessage(event: MessageEvent): Promise<void> {
        try {
            const data = JSON.parse(event.data);
            console.log("LauncherMessageProcessor: 会話用WebSocketメッセージを受信しました", data);
            
            // 会話用WebSocketのメッセージ処理（将来実装）
            // 現在は音声再生などの処理を想定
            
        } catch (error) {
            console.error("LauncherMessageProcessor: メッセージ処理エラー", error);
            if (error instanceof Error) {
                console.error('エラー詳細:', error.message);
            }
        }
    }
}
