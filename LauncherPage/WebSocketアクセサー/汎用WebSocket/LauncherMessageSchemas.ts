/**
 * LauncherMessageSchemas.ts
 * 
 * Launcher汎用WebSocketで受信するメッセージのZodスキーマ定義
 * AppVoiroStudioの汎用送信データと統一した型安全性を提供
 */

import { z } from 'zod';

/**
 * キャラクター状態情報（1キャラ分）のスキーマ
 */
export const CharacterStateInfoSchema = z.object({
    character_id: z.string(),
    character_name: z.string(),
    save_id: z.string(),
    tts_software: z.string(),
    voice_mode: z.string(),
    voice_mode_id: z.number(),
    voice_mode_id_str: z.string(),
    client_id: z.string(),
    launch_source: z.enum(['browser', 'electron'])
});

export type CharacterStateInfo = z.infer<typeof CharacterStateInfoSchema>;

/**
 * 全キャラクター状態リスト通知のスキーマ
 */
export const CharacterStateListDataSchema = z.object({
    characters: z.array(CharacterStateInfoSchema)
});

export type CharacterStateListData = z.infer<typeof CharacterStateListDataSchema>;

/**
 * キャラクター更新通知のスキーマ（将来の拡張用）
 */
export const CharacterUpdatedDataSchema = z.object({
    character_id: z.string(),
    // 将来的に更新フィールドを追加
});

export type CharacterUpdatedData = z.infer<typeof CharacterUpdatedDataSchema>;

/**
 * 汎用送信データタイプのenum定義
 */
export enum LauncherMessageType {
    CharacterStateList = "CharacterStateList",
    CharacterUpdated = "CharacterUpdated",
    OpenFolderRequest = "OpenFolderRequest"
}

/**
 * 判別可能ユニオン型による汎用送信データ
 * TypeScript側での型安全性を提供
 */
export type LauncherMessage =
    | { type: LauncherMessageType.CharacterStateList; data: CharacterStateListData }
    | { type: LauncherMessageType.CharacterUpdated; data: CharacterUpdatedData };

/**
 * 各データタイプに対応するZodスキーマの定義
 */
const LauncherMessageSchemaMap = {
    [LauncherMessageType.CharacterStateList]: z.object({
        type: z.literal(LauncherMessageType.CharacterStateList),
        data: CharacterStateListDataSchema
    }),
    [LauncherMessageType.CharacterUpdated]: z.object({
        type: z.literal(LauncherMessageType.CharacterUpdated),
        data: CharacterUpdatedDataSchema
    })
} as const;

/**
 * 判別可能ユニオン型に対応したZodスキーマ
 * 実行時型検証に使用
 */
export const LauncherMessageSchema = z.discriminatedUnion('type', [
    LauncherMessageSchemaMap[LauncherMessageType.CharacterStateList],
    LauncherMessageSchemaMap[LauncherMessageType.CharacterUpdated]
]);

/**
 * メッセージ検証用ヘルパー関数
 */
export function validateLauncherMessage(data: unknown): LauncherMessage {
    return LauncherMessageSchema.parse(data);
}

/**
 * メッセージ型ガード関数
 */
export function isLauncherMessage(data: unknown): data is LauncherMessage {
    return LauncherMessageSchema.safeParse(data).success;
}
