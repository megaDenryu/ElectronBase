/**
 * ILauncherConversationWebSocket.ts
 * 
 * ランチャーページ用の会話用WebSocketインターフェース
 * AppVoiroStudioのI会話用WebSocketに対応
 */

import { SendData } from "../../../../ValueObject/DataSend";

export interface ILauncherConversationWebSocket {
    /**
     * メッセージを送信する
     * @param send_data 送信データ
     */
    send(send_data: SendData): void;
}
