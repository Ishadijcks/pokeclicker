class ItemHandler {

    public static stoneSelected: KnockoutObservable<string> = ko.observable('Fire_stone');
    public static pokemonSelected: KnockoutObservable<PokemonNameType> = ko.observable('Vulpix');
    public static amountSelected: KnockoutObservable<number> = ko.observable(1);
    static amount: KnockoutObservable<number> = ko.observable(1);
    public static amountToUse = 1;

    public static useItem(name: string, amount = 1): boolean {
        if (!player.itemList[name]()) {
            Notifier.notify({
                message: `You don't have any ${ItemList[name].displayName}s left...`,
                type: NotificationConstants.NotificationOption.danger,
            });
            return false;
        }
        // Only allow the player to use the amount they have maximum
        this.amountToUse = Math.min(player.itemList[name](), amount);

        player.itemList[name](player.itemList[name]() - this.amountToUse);

        // Use the item, return the resut
        return ItemList[name].use();
    }

    public static hasItem(name: string): boolean {
        return player.itemList[name] ? !!player.itemList[name]() : false;
    }

    public static resetAmount() {
        const input = $('input[name="amountOfStones"]');
        input.val(1).change();
    }

    public static increaseAmount(n: number) {
        const input = $('input[name="amountOfItems"]');
        const newVal = (parseInt(input.val().toString(), 10) || 0) + n;
        input.val(newVal > 1 ? newVal : 1).change();
    }

    public static useStones() {
        if (!this.pokemonSelected()) {
            return Notifier.notify({
                message: 'No Pokémon selected',
                type: NotificationConstants.NotificationOption.danger,
            });
        }
        const amountTotal = Math.min(this.amountSelected(), player.itemList[this.stoneSelected()]());

        if (!amountTotal) {
            return Notifier.notify({
                // TODO: PMX - Update plural system to handle all cases
                message: `You don't have any ${ItemList[this.stoneSelected()].displayName}s left...`,
                type: NotificationConstants.NotificationOption.danger,
            });
        }

        let amountUsed = 0;
        for (let i = 0; i < amountTotal; i++) {
            player.itemList[this.stoneSelected()](player.itemList[this.stoneSelected()]() - 1);
            amountUsed++;
            if ((ItemList[this.stoneSelected()] as EvolutionStone).use(this.pokemonSelected() as PokemonNameType)) {
                // Stop when a shiny is encountered
                break;
            }
        }
        const multiple = amountUsed == 1 ? '' : 's';
        Notifier.notify({
            // TODO: PMX - Update plural system to handle all cases
            message: `You used ${amountUsed} ${ItemList[this.stoneSelected()].displayName}${multiple}`,
            type: NotificationConstants.NotificationOption.success,
        });
    }
}
