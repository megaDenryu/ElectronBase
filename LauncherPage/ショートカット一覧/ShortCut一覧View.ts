import { DivC, HtmlComponentBase, LV2HtmlComponentBase } from "SengenUI/index";



import { ShortcutCommand } from "../../ShortcutValueObjects/ShortcutCommand";
import { ShortcutKey } from "../../ShortcutValueObjects/ShortcutKey";
import { ShortcutRegistration } from "../../ShortcutValueObjects/ShortcutRegistration";
import { ショートカット一覧_枠, ショートカットユニット, ショートカットキー, ショートカットコマンド } from "./shortcut_list_style.css";

export class ShortCut一覧View extends LV2HtmlComponentBase {

    protected _componentRoot: DivC;

    constructor(registrations: ShortcutRegistration[]) {
        super();
        this._componentRoot = this.createComponentRoot(registrations);
    }

    protected createComponentRoot(registrations: ShortcutRegistration[]): DivC {
        return new DivC({text: "ショートカット一覧", class: ショートカット一覧_枠}).childs(
                    //ShortCutUnitViewは縦並びにする想定
                    registrations.map(registration => new ShortCutUnitView(registration))
                );
    }

    public addShortCut(registration: ShortcutRegistration): void {
        const shortCutUnitView = new ShortCutUnitView(registration);
        this._componentRoot.child(shortCutUnitView);
    }
}


class ShortCutUnitView extends LV2HtmlComponentBase {
    protected _componentRoot: HtmlComponentBase;

    constructor(shortcutRegistration: ShortcutRegistration) {
        super();
        this._componentRoot = this.createComponentRoot(shortcutRegistration);
    }

    protected createComponentRoot(shortcutRegistration: ShortcutRegistration): HtmlComponentBase {
        return new DivC({class: ショートカットユニット}).childs([
                    // ShortCutKeyView と ShortCutCommandView は横並びにする想定
                    new ShortCutKeyView(shortcutRegistration.key),
                    new ShortCutCommandView(shortcutRegistration.command)
                ]);
    }

}

class ShortCutKeyView extends LV2HtmlComponentBase {
    protected _componentRoot: HtmlComponentBase;
    constructor(key: ShortcutKey) {
        super();
        this._componentRoot = this.createComponentRoot(key);
    }
    protected createComponentRoot(key: ShortcutKey): HtmlComponentBase {
        return new DivC({class: ショートカットキー});//仮置き。あとで修正する
    } 
}

class ShortCutCommandView extends LV2HtmlComponentBase {
    protected _componentRoot: HtmlComponentBase;
    constructor(command: ShortcutCommand) {
        super();
        this._componentRoot = this.createComponentRoot(command);
    }
    protected createComponentRoot(command: ShortcutCommand): HtmlComponentBase {
        return new DivC({class: ショートカットコマンド});//仮置き。あとで修正する
    }
}
