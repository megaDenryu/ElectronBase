/**
 * ElectronDIContainer.ts
 * 
 * 依存関係を解決するDIコンテナ
 */

import { app } from 'electron';
import { MainWindowFactory } from "../ElectronInfla/MainWindowFactory";
import { IpcHandlerImpl } from "../Electron機能コンポーネント/IpcHandlerImpl";
import { ServerConfigManager } from "../Electron機能コンポーネント/ServerConfigManager";
import { PythonServerManager } from "../Electron機能コンポーネント/PythonServerManager";
import { ElectronAppState } from "../Electron機能コンポーネント/ElectronAppState";
import { GlobalShortcutManager } from "../Electron機能コンポーネント/GlobalShortcutManager";
import { IOnWhenReady, OnWhenReady } from "../ElectronLifecycleHandlers/OnWhenReady";
import { IOnActivate, OnActivate } from "../ElectronLifecycleHandlers/OnActivate";
import { IOnWindowAllClosed, OnWindowAllClosed } from "../ElectronLifecycleHandlers/OnWindowAllClosed";
import { IOnBeforeQuit, OnBeforeQuit } from "../ElectronLifecycleHandlers/OnBeforeQuit";

export class ElectronDIContainer {
    // 機能コンポーネント
    public appState: ElectronAppState;
    public serverConfigManager: ServerConfigManager;
    public serverManager: PythonServerManager;
    public ipcHandler: IpcHandlerImpl;
    public windowFactory: MainWindowFactory;
    public globalShortcutManager: GlobalShortcutManager;

    // ライフサイクルハンドラ
    public onWhenReady: IOnWhenReady;
    public onActivate: IOnActivate;
    public onWindowAllClosed: IOnWindowAllClosed;
    public onBeforeQuit: IOnBeforeQuit;

    constructor() {
        // 機能コンポーネントの初期化
        this.appState = new ElectronAppState();
        this.serverConfigManager = new ServerConfigManager();
        this.serverManager = new PythonServerManager(this.serverConfigManager);
        this.ipcHandler = new IpcHandlerImpl(this.serverManager, this.serverConfigManager);
        this.windowFactory = new MainWindowFactory(this.serverManager, this.ipcHandler);
        this.globalShortcutManager = new GlobalShortcutManager();

        // ライフサイクルハンドラの初期化(DIで依存関係を注入)
        this.onWhenReady = new OnWhenReady(
            this.windowFactory,
            this.serverManager,
            this.ipcHandler,
            this.globalShortcutManager,
            this.appState
        );

        this.onActivate = new OnActivate(
            this.windowFactory,
            this.appState
        );

        this.onWindowAllClosed = new OnWindowAllClosed(app);

        this.onBeforeQuit = new OnBeforeQuit(
            this.serverManager,
            this.globalShortcutManager,
            this.appState
        );
    }
}
