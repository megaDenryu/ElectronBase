/**
 * ShortcutRegistration.ts
 * 
 * ショートカットキーとコマンドのペアを管理する値オブジェクト
 */

import { ShortcutKey } from './ShortcutKey';
import { ShortcutCommand } from './ShortcutCommand';

export class ShortcutRegistration {
    private readonly _key: ShortcutKey;
    private readonly _command: ShortcutCommand;

    constructor(key: ShortcutKey, command: ShortcutCommand) {
        this._key = key;
        this._command = command;
    }

    public get key(): ShortcutKey {
        return this._key;
    }

    public get command(): ShortcutCommand {
        return this._command;
    }

    /**
     * このショートカット登録を実行
     */
    public async execute(): Promise<void> {
        await this._command.execute();
    }

    public toString(): string {
        return `[${this._key.value}] -> ${this._command.toString()}`;
    }
}
