import { DocumentBody, DocumentBodyC, HtmlComponentBase, HtmlComponentChild } from "SengenUI/index";



/**
 * モーダルパネルのインターフェース
 */
export interface IModalPanel {
    open(): void;
    close(): void;
    getRoot(): HtmlComponentBase;
}

/**
 * LauncherPageのウィンドウ・モーダル管理クラス
 * 
 * 責務:
 * - メインウィンドウの登録と管理
 * - モーダルパネルの表示・非表示制御
 * - DOMへの適切な追加・削除
 */
export class LauncherPageWindowManager {
    private _modalPanels: Map<string, IModalPanel> = new Map();
    
    public constructor() {
        // 初期化コード
    }

    /**
     * メインウィンドウを登録
     */
    public registerWindow(window: HtmlComponentChild): this {
        DocumentBody().child(window);
        return this;
    }

    /**
     * モーダルパネルを登録
     * @param id パネルの識別子
     * @param panel モーダルパネルのインスタンス
     */
    public registerModalPanel(id: string, panel: IModalPanel): this {
        this._modalPanels.set(id, panel);
        return this;
    }

    /**
     * モーダルパネルを表示
     * @param id パネルの識別子
     */
    public showModalPanel(id: string): void {
        const panel = this._modalPanels.get(id);
        if (!panel) {
            console.error(`Modal panel with id '${id}' not found`);
            return;
        }
        
        // パネルをDOMに追加して表示
        DocumentBody().child(panel.getRoot());
        panel.open();
    }

    /**
     * モーダルパネルを非表示
     * @param id パネルの識別子
     */
    public hideModalPanel(id: string): void {
        const panel = this._modalPanels.get(id);
        if (!panel) {
            console.error(`Modal panel with id '${id}' not found`);
            return;
        }
        
        panel.close();
    }

    /**
     * 登録されたモーダルパネルを取得
     * @param id パネルの識別子
     */
    public getModalPanel(id: string): IModalPanel | undefined {
        return this._modalPanels.get(id);
    }
}
