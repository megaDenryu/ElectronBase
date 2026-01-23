/**
 * GlobalShortcutManager.ts
 * 
 * グローバルショートカットの登録・解除を管理
 * 開発方針: シンプル化 - サーバー側で選択キャラクターを管理
 */

import { globalShortcut, clipboard } from 'electron';
import { ShortcutKey } from '../ShortcutValueObjects/ShortcutKey';
import { ShortcutCommand } from '../ShortcutValueObjects/ShortcutCommand';
import { ShortcutRegistration } from '../ShortcutValueObjects/ShortcutRegistration';
import { NodeLog } from 'TypeScriptBenriKakuchou/DebugLogForNode';
import { RequestAPI } from 'TypeScriptBenriKakuchou/Web/RequestApi';
import { IResultMessage } from 'TypeScriptBenriKakuchou/Web/ResultMessage';

export interface IGlobalShortcutManager {
    registerShortcuts(): void;
    unregisterAllShortcuts(): void;
}

export class GlobalShortcutManager implements IGlobalShortcutManager {
    private _registrations: ShortcutRegistration[] = [];

    constructor() {
        // SelectedCharacterManagerへの依存を削除
    }

    /**
     * LV2: ショートカットを登録
     */
    public registerShortcuts(): void {
        this.registerClipboardToSpeechShortcut();
        this.registerOtherShortcuts();
    }

    /**
     * LV2: すべてのショートカットを解除
     */
    public unregisterAllShortcuts(): void {
        this.unregisterAll();
    }

    /**
     * LV1: [クリップボードから音声合成]のショートカットを登録
     */
    private registerClipboardToSpeechShortcut(): void {
        const key = ShortcutKey.clipboardToSpeech();
        const command = new ShortcutCommand(
            'ClipboardToSpeech',
            () => this.executeClipboardToSpeech(),
            'クリップボードのテキストを音声合成'
        );
        const registration = new ShortcutRegistration(key, command);

        this.registerShortcut(registration);
    }

    /**
     * LV1: その他のショートカットを登録
     */
    private registerOtherShortcuts(): void {
        // 将来的に追加のショートカットをここに実装
    }

    /**
     * LV1: 登録されたすべてのショートカットを解除
     */
    private unregisterAll(): void {
        globalShortcut.unregisterAll();
        this._registrations = [];
    }

    /**
     * LV0: ショートカット登録を実行
     */
    private registerShortcut(registration: ShortcutRegistration): void {
        const success = globalShortcut.register(registration.key.value, () => {
            NodeLog.print(`shortcutKey [${registration.key.value}] pressed`);
            registration.execute().catch(error => {
                NodeLog.print('ショートカット実行でエラーが発生:' + error);
            });
        });

        if (success) {
            this._registrations.push(registration);
            NodeLog.print(`shortcut registered: ${registration.key.value} Success`);
        } else {
            NodeLog.print(`shortcut registered: ${registration.key.value} Failed`);
        }
    }

    /**
     * LV0: クリップボードから音声合成を実行
     * サーバー側で選択キャラクターを管理するため、テキストのみ送信
     */
    private async executeClipboardToSpeech(): Promise<void> {
        const text = clipboard.readText();

        NodeLog.print(["Shortcut activated!", {
            clipboardText: text
        }]);

        if (!text || text.trim().length === 0) {
            NodeLog.print('エラー: クリップボードが空です');
            return;
        }

        await this.sendTextToSpeechServer(text);
    }

    /**
     * LV0: テキストを音声合成サーバーに送信
     * キャラクター選択はサーバー側で管理
     */
    private async sendTextToSpeechServer(text: string): Promise<void> {
        try {
            NodeLog.print('音声合成サーバーにリクエストを送信します...');
            NodeLog.print(`送信テキスト: ${text}`);

            const result = await RequestAPI.postRequest2<IResultMessage>("ShortCut", {
                type: 'clipboard_to_speech',
                data: text
            });

            NodeLog.print('音声合成リクエストが成功しました', result);
        } catch (error) {
            NodeLog.print('音声合成リクエストでエラーが発生: ' + error);
        }
    }
}
