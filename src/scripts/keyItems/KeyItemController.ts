///<reference path="../keyItems/KeyItems.ts"/>

class KeyItemController {
    private static _inspectedItem: KnockoutObservable<KeyItems.KeyItem> = ko.observable(KeyItems.KeyItem.Teachy_tv);
    private static _selectedItem: KnockoutObservable<KeyItems.KeyItem> = ko.observable(KeyItems.KeyItem.Teachy_tv);
    private static _latestGainedItem: KnockoutObservable<KeyItems.KeyItem> = ko.observable(KeyItems.KeyItem.Teachy_tv)

    static showGainModal(item: KeyItems.KeyItem) {
        this.latestGainedItem = item;
        $('.modal').modal('hide');
        $('#keyItemModal').modal({
            backdrop: 'static',
            keyboard: false,
        });
    }

    public static hover(item: KeyItems.KeyItem) {
        this.inspectedItem = item;
    }

    public static hoverRelease() {
        this.selectedItem = this.inspectedItem;
    }

    static get inspectedItem() {
        return this._inspectedItem();
    }

    static set inspectedItem(item: KeyItems.KeyItem) {
        this._inspectedItem(item);
    }

    static get selectedItem() {
        return this._selectedItem();
    }

    static set selectedItem(item: KeyItems.KeyItem) {
        this._selectedItem(item);
    }

    static get latestGainedItem() {
        return this._latestGainedItem();
    }

    static set latestGainedItem(item: KeyItems.KeyItem) {
        this._latestGainedItem(item);
    }
}

