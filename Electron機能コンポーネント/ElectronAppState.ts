/**
 * ElectronAppState.ts
 * 
 * Electronアプリケーションの状態を管理
 * ウィンドウ、プロセスなどの参照を保持
 */

import { BrowserWindow } from 'electron';
import { ChildProcess } from 'child_process';

export class ElectronAppState {
    private _mainWindow: BrowserWindow | null = null;
    private _pythonServerProcess: ChildProcess | null = null;

    public get mainWindow(): BrowserWindow | null {
        return this._mainWindow;
    }

    public set mainWindow(window: BrowserWindow | null) {
        this._mainWindow = window;
    }

    public get pythonServerProcess(): ChildProcess | null {
        return this._pythonServerProcess;
    }

    public set pythonServerProcess(process: ChildProcess | null) {
        this._pythonServerProcess = process;
    }

    public hasMainWindow(): boolean {
        return this._mainWindow !== null;
    }

    public hasServerProcess(): boolean {
        return this._pythonServerProcess !== null;
    }
}
