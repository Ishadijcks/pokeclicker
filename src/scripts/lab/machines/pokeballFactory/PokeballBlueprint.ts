class PokeballBlueprint {

    constructor(
        public name: string,
        public type: PokeballBlueprintType,
        public time: number,
        public cost: { item: BagItem, amount: number}[],
        public pokeballType: GameConstants.Pokeball,
        public research?: Lab.Research
    ) { }

    get canFabricate(): boolean {
        return this.cost.every(cost => {
            return BagHandler.amount(cost.item)() >= cost.amount;
        });
    }

    get costTooltip(): string {
        return this.cost.map(itemCost => {
            return `${BagHandler.displayName(itemCost.item)}: ${itemCost.amount}`;
        }).join('<br>');
    }

    get item(): BagItem {
        return {type: ItemType.item, id: GameConstants.Pokeball[this.pokeballType]};
    }

}
