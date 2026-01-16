/**
 * ShortcutKey.ts
 * 
 * ショートカットキーを表す値オブジェクト
 * ElectronのglobalShortcut形式のキー文字列をカプセル化
 */

export class ShortcutKey {
    private readonly _key: string;

    constructor(key: string) {
        this.validateKey(key);
        this._key = key;
    }

    public get value(): string {
        return this._key;
    }

    /**
     * キーの妥当性を検証
     */
    private validateKey(key: string): void {
        if (!key || key.trim().length === 0) {
            throw new Error('ショートカットキーは空にできません');
        }
    }

    /**
     * 標準的なショートカットキーのファクトリーメソッド
     */
    public static clipboardToSpeech(): ShortcutKey {
        return new ShortcutKey('CommandOrControl+Alt+R');
    }

    public static testShortcut(): ShortcutKey {
        return new ShortcutKey('CommandOrControl+Shift+F11');
    }

    public equals(other: ShortcutKey): boolean {
        return this._key === other._key;
    }

    public toString(): string {
        return this._key;
    }
}
