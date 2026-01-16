/**
 * ILauncherWebSocket部.ts
 * 
 * ランチャーページ用のWebSocket部インターフェース
 * AppVoiroStudioのIWebSocket部に対応
 */

import { ILauncherConversationWebSocket } from "../会話用WebSocket/ILauncherConversationWebSocket";
import { Launcher汎用WebSocket2 } from "../汎用WebSocket/Launcher汎用WebSocket2";

export interface ILauncherWebSocket部 {
    readonly conversationWebSocket: ILauncherConversationWebSocket;
    readonly 汎用WebSocket: Launcher汎用WebSocket2;
}
