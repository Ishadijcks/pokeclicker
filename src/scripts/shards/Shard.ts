class Shard extends Item {

    constructor(public type: PokemonType) {
        super(`${PokemonType[type]} Shard`, { imageDirectory: 'shards' });
    }

    public static isShard(args: any): args is Shard {
        return args instanceof Shard;
    }

    gain(amount: number) {
        super.gain(amount);

        if (amount > 0) {
            GameHelper.incrementObservable(App.game.statistics.totalShardsGained, amount);
            GameHelper.incrementObservable(App.game.statistics.shardsGained[this.type], amount);
        }
    }

}

// Creating all Shard items
Object.keys(PokemonType).map(Number).filter((item) => item >= 0).forEach(type => {
    ItemList[`${PokemonType[type]} Shard`] = new Shard(type);
});
