/**
 * LauncherConversationWebSocket.ts
 * 
 * ランチャーページ用の会話用WebSocket
 * AppVoiroStudioの会話用WebSocket2に対応
 * 
 * 責務:
 * - 会話用WebSocketの接続管理
 * - メッセージの送受信
 * - 自動再接続
 * - MessageProcessorへのイベント委譲
 */

import { ExtendedWebSocket } from "Extend/extend";
import { SendData } from "../../../../ValueObject/DataSend";
import { ILauncherMessageProcessor } from "../../MessageProcess/ILauncherMessageProcessor";
import { LauncherURLBaseInfo } from "../URLBaseInfo";
import { ILauncherConversationWebSocket } from "./ILauncherConversationWebSocket";

export class LauncherConversationWebSocket implements ILauncherConversationWebSocket {
    private _socket: ExtendedWebSocket;
    private _urlBase: LauncherURLBaseInfo;
    private readonly _messageProcessor: ILauncherMessageProcessor;

    constructor(urlBase: LauncherURLBaseInfo, messageProcessor: ILauncherMessageProcessor) {
        this._urlBase = urlBase;
        this._messageProcessor = messageProcessor;
        this._socket = new ExtendedWebSocket(
            `ws://${urlBase.localhost}:${urlBase.port}/speakVoiceRoid2/${urlBase.client_id}`
        );
        this.connect();
    }

    private connect(): void {
        this._socket.onopen = this.onOpen.bind(this);
        this._socket.onmessage = this.onMessage.bind(this);
        this._socket.onclose = this.onClose.bind(this);
        this._socket.onerror = (error) => {
            console.error('LauncherConversationWebSocket: WebSocketエラー', error);
        };
    }

    private onOpen(): void {
        console.log(`LauncherConversationWebSocket: 接続完了 client_id: ${this._urlBase.client_id}`);
    }

    private onMessage(event: MessageEvent): void {
        this._messageProcessor.onMessage(event);
    }

    private onClose(): void {
        console.log("LauncherConversationWebSocket: 切断されました。再接続します。");
        setTimeout(() => this.connect(), 1000);
    }

    public send(send_data: SendData): void {
        const ret = JSON.stringify(send_data);
        this._socket.send(ret);
    }
}
