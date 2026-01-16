/**
 * ShortcutCommand.ts
 * 
 * ショートカットキーに対応する実行コマンドを表す値オブジェクト
 */

export type CommandExecutor = () => void | Promise<void>;

export class ShortcutCommand {
    private readonly _name: string;
    private readonly _executor: CommandExecutor;
    private readonly _description: string;

    constructor(name: string, executor: CommandExecutor, description: string = '') {
        this.validateCommand(name, executor);
        this._name = name;
        this._executor = executor;
        this._description = description;
    }

    public get name(): string {
        return this._name;
    }

    public get description(): string {
        return this._description;
    }

    /**
     * コマンドを実行
     */
    public async execute(): Promise<void> {
        await this._executor();
    }

    /**
     * コマンドの妥当性を検証
     */
    private validateCommand(name: string, executor: CommandExecutor): void {
        if (!name || name.trim().length === 0) {
            throw new Error('コマンド名は空にできません');
        }
        if (typeof executor !== 'function') {
            throw new Error('executorは関数である必要があります');
        }
    }

    public toString(): string {
        return `${this._name}${this._description ? `: ${this._description}` : ''}`;
    }
}
