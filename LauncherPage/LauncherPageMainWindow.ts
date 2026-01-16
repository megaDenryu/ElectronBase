import { ButtonC, DivC, H1C, HtmlComponentBase, LV2HtmlComponentBase } from "SengenUI/index";
/**
 * LauncherPageView.ts
 * 
 * ランチャーアプリのメインページUI
 * テストページマネージャーと同様のコンテンツ切り替え機能を実装
 */






import { 明るくて優しい色をランダムに出力 } from 'TypeScriptBenriKakuchou/ExtendRandom.ts/RandomColor';
import { 
    launcher_container, 
    launcher_header, 
    launcher_body,
    launcher_content, 
    launcher_title, 
    launcher_sidebar,
    sidebar_button,
    sidebar_button_active,
    content_viewport_empty
} from './style.css';

/**
 * コンテンツページの情報
 */
export interface ILauncherPageInfo {
    name: string;
    description?: string;
    factory: () => HtmlComponentBase;
}

/**
 * ランチャーのメインビュー
 */
export class LauncherPageMainWindow extends LV2HtmlComponentBase {
    protected _componentRoot: HtmlComponentBase;
    private _contentPages: Map<string, ILauncherPageInfo> = new Map();
    private _activePageId: string | null = null;
    private _pageInstances: Map<string, HtmlComponentBase> = new Map(); // ページインスタンスを保持
    private _viewportContainer: DivC;
    private _buttonContainer: DivC;
    private _buttonMap: Map<string, ButtonC> = new Map();

    constructor() {
        super();
        this._componentRoot = this.createComponentRoot();
    }

    /**
     * LV2: コンポーネントルートを作成
     */
    protected createComponentRoot(): HtmlComponentBase {
        const containerBgColor = 明るくて優しい色をランダムに出力({
            saturationMin: 0.2,
            saturationMax: 0.4,
            lightnessMin: 0.85,
            lightnessMax: 0.95
        });
        
        return new DivC({ class: launcher_container })
            .setStyleCSS({
                backgroundColor: `${containerBgColor.hex}F0`
            })
            .childs([
                this.Header(),
                this.Body()
            ]);
    }

    /**
     * LV2: ヘッダー部分を作成
     */
    private Header(): HtmlComponentBase {
        const headerBgColor = 明るくて優しい色をランダムに出力({
            saturationMin: 0.25,
            saturationMax: 0.45,
            lightnessMin: 0.82,
            lightnessMax: 0.93
        });
        
        return new DivC({ class: launcher_header })
            .setStyleCSS({
                backgroundColor: `${headerBgColor.hex}99`
            })
            .child(
                new H1C({ text: 'VoiroStudio Launcher', class: launcher_title })
            );
    }

    /**
     * LV2: ボディ部分（サイドバー + コンテンツ）を作成
     */
    private Body(): HtmlComponentBase {
        return new DivC({ class: launcher_body }).childs([
            this.TabButtonsSideBar(),
            this.Content()
        ]);
    }

    /**
     * LV2: サイドバーを作成
     */
    private TabButtonsSideBar(): HtmlComponentBase {
        const sidebarBgColor = 明るくて優しい色をランダムに出力({
            saturationMin: 0.2,
            saturationMax: 0.4,
            lightnessMin: 0.83,
            lightnessMax: 0.92
        });
        
        return new DivC({ class: launcher_sidebar })
            .setStyleCSS({
                backgroundColor: `${sidebarBgColor.hex}B3`
            })
            .bind((container) => {
                this._buttonContainer = container;
            });
    }

    /**
     * LV2: コンテンツ部分を作成
     */
    private Content(): HtmlComponentBase {
        const contentBgColor = 明るくて優しい色をランダムに出力({
            saturationMin: 0.15,
            saturationMax: 0.35,
            lightnessMin: 0.88,
            lightnessMax: 0.96
        });
        
        return new DivC({ class: launcher_content })
            .setStyleCSS({backgroundColor: `${contentBgColor.hex}80`})
            .bind((div) => {
                this._viewportContainer = div;
                this.renderEmptyState();
            });
    }

    /**
     * サイドバーボタンを作成
     */
    private createSideBarButton(id: string, info: ILauncherPageInfo): ButtonC {
        // 強めのランダムカラーを生成（中心色）
        const baseColor = 明るくて優しい色をランダムに出力({
            saturationMin: 0.55,
            saturationMax: 0.75,
            lightnessMin: 0.45,
            lightnessMax: 0.65
        });
        
        // HEXをRGBに変換
        const r = parseInt(baseColor.hex.slice(1, 3), 16);
        const g = parseInt(baseColor.hex.slice(3, 5), 16);
        const b = parseInt(baseColor.hex.slice(5, 7), 16);
        
        // 振動アニメーションを設定（中強→強→超強→強→中強のループ）
        const animationKeyframes = `
            @keyframes borderPulse-${id} {
                0% { border-color: rgba(${r}, ${g}, ${b}, 0.1); border-width: 2px; }
                25% { border-color: rgba(${r}, ${g}, ${b}, 1); border-width: 2px; }
                50% { border-color: rgba(${r}, ${g}, ${b}, 1); border-width: 2px; }
                75% { border-color: rgba(${r}, ${g}, ${b}, 1); border-width: 2px; }
                100% { border-color: rgba(${r}, ${g}, ${b}, 0.1); border-width: 2px; }
            }
        `;
        
        // スタイルタグに追加
        const styleElement = document.createElement('style');
        styleElement.textContent = animationKeyframes;
        document.head.appendChild(styleElement);
        
        return new ButtonC({ class: sidebar_button, text: info.name })
            .addTypedEventListener("click", () => {
                this.toggleContentPage(id);
            })
            .setStyleCSS({
                backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
                borderColor: `rgba(${r}, ${g}, ${b}, 0.7)`,
                animation: `borderPulse-${id} 4s ease-in-out infinite`
            });
    }

    /**
     * コンテンツページの表示/非表示を切り替え
     */
    private toggleContentPage(id: string): void {
        if (this._activePageId === id) {
            // 同じボタンを押したら非表示にして破棄
            this.deactivateCurrentPage();
        } else {
            // 別のページに切り替え
            this.deactivateCurrentPage();
            this.activatePage(id);
        }
    }

    /**
     * コンテンツページをアクティブ化
     */
    private activatePage(id: string): void {
        const info = this._contentPages.get(id);
        if (!info) return;

        // インスタンスがまだ作成されていなければ作成
        if (!this._pageInstances.has(id)) {
            const instance = info.factory();
            this._pageInstances.set(id, instance);
        }

        const instance = this._pageInstances.get(id)!;
        this._activePageId = id;

        // ビューポートに表示
        this._viewportContainer.clearChildren();
        this._viewportContainer.child(instance);
        instance.show(); // 表示

        // ボタンのスタイルを更新
        this.updateButtonStyles();
    }

    /**
     * 現在アクティブなコンテンツページを非アクティブ化
     */
    private deactivateCurrentPage(): void {
        if (this._activePageId) {
            const instance = this._pageInstances.get(this._activePageId);
            if (instance) {
                instance.hide(); // 非表示にするが削除はしない
            }
        }
        
        this._activePageId = null;
        
        // ビューポートをクリア
        this._viewportContainer.clearChildren();
        this.renderEmptyState();

        // ボタンのスタイルを更新
        this.updateButtonStyles();
    }

    /**
     * 空の状態を表示
     */
    private renderEmptyState(): void {
        this._viewportContainer.child(
            new DivC({ class: content_viewport_empty, text: "左のメニューから機能を選択してください" })
        );
    }

    /**
     * ボタンのアクティブ状態を更新
     */
    private updateButtonStyles(): void {
        this._buttonMap.forEach((button, id) => {
            if (id === this._activePageId) {
                button.addClass(sidebar_button_active);
            } else {
                button.dom.removeCSSClass(sidebar_button_active);
            }
        });
    }

    /**
     * コンテンツページを登録
     */
    public registerContentPage(id: string, info: ILauncherPageInfo): this {
        this._contentPages.set(id, info);
        
        // ボタンを動的に追加
        const button = this.createSideBarButton(id, info);
        this._buttonMap.set(id, button);
        this._buttonContainer.child(button);
        return this;
    }

    /**
     * 複数のコンテンツページを一括登録
     */
    public registerContentPages(pages: Array<{ id: string; info: ILauncherPageInfo }>): this {
        pages.forEach(({ id, info }) => {
            this.registerContentPage(id, info);
        });
        return this;
    }

    public destroy(): void {
        // すべてのページインスタンスを削除
        this._pageInstances.forEach((instance) => {
            instance.delete();
        });
        this._pageInstances.clear();
        this.deactivateCurrentPage();
        super.delete();
    }
}

/**
 * プレースホルダーコンテンツページ
 * 実際のコンテンツページが実装されるまでの一時的なページ
 */
export class PlaceholderContentPage extends LV2HtmlComponentBase {
    protected _componentRoot: HtmlComponentBase;
    private _title: string;

    constructor(title: string) {
        super();
        this._title = title;
        this._componentRoot = this.createComponentRoot();
    }

    protected createComponentRoot(): HtmlComponentBase {
        return new DivC().childs([
            new H1C({ text: this._title }).setStyleCSS({ color: '#6a7a9a' }),
            new DivC({ text: 'このページは現在開発中です。' })
                .setStyleCSS({ marginTop: '20px', color: '#9a9aaa' })
        ]);
    }
}
