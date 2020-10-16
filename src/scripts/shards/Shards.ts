class Shards implements Feature {
    name = 'Shards';
    saveKey = 'shards';

    public static readonly nTypes: number =
        GameHelper.enumLength(PokemonType) - 1;
    public static readonly nEffects: number =
        GameHelper.enumLength(GameConstants.TypeEffectiveness);

    defaults = {
        'shardWallet': Array<number>(Shards.nTypes).fill(0),
        'shardUpgrades': Array<number>(Shards.nTypes * Shards.nEffects).fill(0),
    };

    public shardWallet: Array<KnockoutObservable<number>>;
    public shardUpgrades: Array<KnockoutObservable<number>>;

    constructor() {
        this.shardWallet = this.defaults.shardWallet.map((v) => ko.observable(v));
        this.shardUpgrades = this.defaults.shardUpgrades.map((v) => ko.observable(v));
    }

    public gainShards(amt: number, typeNum: PokemonType) {
        if (!this.canAccess()) {
            return;
        }

        if (typeNum == PokemonType.None) {
            return;
        }
        if (amt > 0) {
            GameHelper.incrementObservable(this.shardWallet[typeNum], amt);
            GameHelper.incrementObservable(App.game.statistics.totalShardsGained, amt);
            GameHelper.incrementObservable(App.game.statistics.shardsGained[typeNum], amt);
        }
    }

    public getShardUpgradeCost(
        typeNum: PokemonType,
        effectNum: GameConstants.TypeEffectiveness
    ): number {
        const cost = (this.getShardUpgrade(typeNum, effectNum) + 1) * Shards.SHARD_UPGRADE_COST;
        return cost;
    }

    public hasMaxUpgrade(
        typeNum: PokemonType,
        effectNum: GameConstants.TypeEffectiveness
    ): boolean {
        return this.getShardUpgrade(typeNum, effectNum) >= Shards.MAX_SHARD_UPGRADES;
    }

    public canBuyShardUpgrade(
        typeNum: PokemonType,
        effectNum: GameConstants.TypeEffectiveness
    ): boolean {
        const lessThanMax = !this.hasMaxUpgrade(typeNum, effectNum);
        const hasEnoughShards = this.shardWallet[typeNum]() >= this.getShardUpgradeCost(typeNum, effectNum);
        return lessThanMax && hasEnoughShards;
    }

    public buyShardUpgrade(
        typeNum: PokemonType,
        effectNum: GameConstants.TypeEffectiveness
    ) {
        if (this.canBuyShardUpgrade(typeNum, effectNum)) {
            this.gainShards(-this.getShardUpgradeCost(typeNum, effectNum), typeNum);
            GameHelper.incrementObservable(this.shardUpgrades[typeNum * Shards.nEffects + effectNum]);
        }
    }

    public getShardUpgrade(
        typeNum: PokemonType,
        effectNum: GameConstants.TypeEffectiveness
    ): number {
        return this.shardUpgrades[typeNum * Shards.nEffects + effectNum]();
    }

    initialize() {
    }

    canAccess(): boolean {
        return App.game.keyItems.hasKeyItem(KeyItems.KeyItem.Shard_case);
    }

    update(delta: number) {
    }

    toJSON(): Record<string, any> {
        return {
            'shardWallet': this.shardWallet.map(ko.unwrap),
            'shardUpgrades': this.shardUpgrades.map(ko.unwrap),
        };
    }

    fromJSON(json: Record<string, any>) {
        if (json != null) {
            json['shardWallet'].forEach((v, i) => {
                this.shardWallet[i](v);
            });
            json['shardUpgrades'].forEach((v, i) => {
                this.shardUpgrades[i](v);
            });
        }
    }

    public openShardModal() {
        if (this.canAccess()) {
            $('#shardModal').modal('show');
        } else {
            Notifier.notify({
                message: 'You do not have the Shard Case',
                type: NotificationConstants.NotificationOption.warning,
            });
        }
    }
}

namespace Shards {
    export const SHARD_UPGRADE_COST = 500;
    export const SHARD_UPGRADE_STEP = 0.1;
    export const MAX_SHARD_UPGRADES = 10;
}
