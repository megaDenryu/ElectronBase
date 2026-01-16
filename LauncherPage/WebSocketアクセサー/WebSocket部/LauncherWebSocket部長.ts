/**
 * LauncherWebSocket部長.ts
 * 
 * ランチャーページ用のWebSocket統合管理クラス
 * AppVoiroStudioのWebSocket部長2に対応
 * 
 * 責務:
 * - WebSocket接続の統合管理（会話用・汎用）
 * - URLBaseInfoとMessageProcessorの注入
 * - 接続状態の集約管理
 */

import { ILauncherMessageProcessor } from "../../MessageProcess/ILauncherMessageProcessor";
import { LauncherURLBaseInfo } from "../URLBaseInfo";
import { ILauncherConversationWebSocket } from "../会話用WebSocket/ILauncherConversationWebSocket";
import { LauncherConversationWebSocket } from "../会話用WebSocket/LauncherConversationWebSocket";
import { Launcher汎用WebSocket2, LauncherGeneralWebSocketCallbacks } from "../汎用WebSocket/Launcher汎用WebSocket2";
import { ILauncherWebSocket部 } from "./ILauncherWebSocket部";

export interface LauncherWebSocket部長Options {
    generalWebSocketCallbacks?: LauncherGeneralWebSocketCallbacks;
}

export class LauncherWebSocket部長 implements ILauncherWebSocket部 {
    public readonly conversationWebSocket: ILauncherConversationWebSocket;
    public readonly 汎用WebSocket: Launcher汎用WebSocket2;

    constructor(
        urlBase: LauncherURLBaseInfo, 
        messageProcessor: ILauncherMessageProcessor,
        options: LauncherWebSocket部長Options = {}
    ) {
        this.conversationWebSocket = new LauncherConversationWebSocket(urlBase, messageProcessor);
        this.汎用WebSocket = new Launcher汎用WebSocket2(urlBase, options.generalWebSocketCallbacks);
    }
}
