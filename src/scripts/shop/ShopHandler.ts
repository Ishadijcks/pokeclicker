///<reference path="Shop.ts"/>

class ShopHandler {
    static shopObservable: KnockoutObservable<Shop> = ko.observable(new Shop([]));
    static selected: KnockoutObservable<number> = ko.observable(0);
    static amount: KnockoutObservable<number> = ko.observable(1);

    public static showShop(shop: Shop) {
        this.setSelected(0);
        this.resetAmount();
        this.shopObservable(shop);
    }

    //#region Controls

    public static setSelected(i: number) {
        this.selected(i);
    }

    public static getShopEntry() {
        return ShopEntriesList[this.shopObservable().shopEntries[ShopHandler.selected()]];
    }

    public static buyItem() {
        const shopEntry = this.getShopEntry();
        if (!shopEntry) {
            return;
        }
        shopEntry.buy(this.amount());
        ShopHandler.resetAmount();
    }

    public static resetAmount() {
        const input = $('input[name="amountOfItems"]');
        input.val(1).change();
    }

    public static increaseAmount(n: number) {
        const input = $('input[name="amountOfItems"]');
        const newVal = (parseInt(input.val().toString(), 10) || 0) + n;
        input.val(newVal > 1 ? newVal : 1).change();
    }

    public static multiplyAmount(n: number) {
        const input = $('input[name="amountOfItems"]');
        const newVal = (parseInt(input.val().toString(), 10) || 0) * n;
        input.val(newVal > 1 ? newVal : 1).change();
    }

    public static maxAmount(n: number) {
        const shopEntry = this.getShopEntry();
        const input = $('input[name="amountOfItems"]');

        if (!shopEntry || !shopEntry.isAvailable()) {
            return input.val(0).change();
        }

        const tooMany = (amt: number) => amt > shopEntry.maxAmount || !App.game.wallet.hasAmount(new Amount(shopEntry.totalPrice(amt), shopEntry.currency));
        const amt = GameHelper.binarySearch(tooMany, 0, Number.MAX_SAFE_INTEGER);

        input.val(amt).change();
    }

    //#endregion

    //#region UI

    public static getShopName(): string {
        if (this.shopObservable().name) {
            return this.shopObservable().name;
        }
        if (player.town()) {
            return `${player.town().name} Shop`;
        }
        return 'Shop';
    }

    public static calculateCss(i: number): string {
        if (this.selected() == i) {
            return 'shopItem clickable btn btn-secondary active';
        } else {
            return 'shopItem clickable btn btn-secondary';
        }
    }

    public static calculateButtonCss(): string {
        const shopEntry = this.getShopEntry();

        if (shopEntry && !(shopEntry.isAvailable() && App.game.wallet.hasAmount(new Amount(shopEntry.totalPrice(this.amount()), shopEntry.currency)))
                || this.amount() < 1) {
            return 'btn btn-danger smallButton smallFont';
        } else {
            return 'btn btn-success smallButton smallFont';
        }
    }

    //#endregion
}
