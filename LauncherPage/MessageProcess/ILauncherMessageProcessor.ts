/**
 * ILauncherMessageProcessor.ts
 * 
 * ランチャーページ用のメッセージ処理インターフェース
 * AppVoiroStudioのIMessageProcessorに対応
 */

export interface ILauncherMessageProcessor {
    /**
     * WebSocketから受信したメッセージを処理する
     * @param event WebSocketメッセージイベント
     */
    onMessage(event: MessageEvent): void;
}
