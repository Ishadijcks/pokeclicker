/// <reference path="../../declarations/GameHelper.d.ts" />
/// <reference path="../../declarations/DataStore/common/Feature.d.ts" />

class Shards implements Feature {
    name = 'Shards';
    saveKey = 'shards';

    public static readonly nTypes: number =
        GameHelper.enumLength(PokemonType) - 1;
    public static readonly nEffects: number =
        GameHelper.enumLength(GameConstants.TypeEffectiveness);
    defaults = {
        'shardUpgrades': Array<number>(Shards.nTypes * Shards.nEffects).fill(0),
    };

    public shards: Shard[] = [];
    public shardUpgrades: Array<KnockoutObservable<number>>;

    public validUpgrades = {};

    constructor() {
        this.shardUpgrades = this.defaults.shardUpgrades.map((v) => ko.observable(v));
        GameHelper.enumNumbers(PokemonType).map(type => {
            this.validUpgrades[type] = {};
            this.validUpgrades[type][GameConstants.TypeEffectiveness.Immune] = !!TypeHelper.typeMatrix[type]?.includes(GameConstants.TypeEffectivenessValue.Immune);
            this.validUpgrades[type][GameConstants.TypeEffectiveness.NotVery] = !!TypeHelper.typeMatrix[type]?.includes(GameConstants.TypeEffectivenessValue.NotVery);
            this.validUpgrades[type][GameConstants.TypeEffectiveness.Normal] = !!TypeHelper.typeMatrix[type]?.includes(GameConstants.TypeEffectivenessValue.Normal);
            this.validUpgrades[type][GameConstants.TypeEffectiveness.Very] = !!TypeHelper.typeMatrix[type]?.includes(GameConstants.TypeEffectivenessValue.Very);
        });
    }

    public gainShards(amount: number, typeNum: PokemonType) {
        if (!this.canAccess()) {
            return;
        }

        if (typeNum == PokemonType.None) {
            return;
        }

        this.shards[typeNum].gain(amount);
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
        if (App.game.challenges.list.disableShards.active()) {
            return false;
        }
        const lessThanMax = !this.hasMaxUpgrade(typeNum, effectNum);
        const hasEnoughShards = this.shards[typeNum].amount() >= this.getShardUpgradeCost(typeNum, effectNum);
        return lessThanMax && hasEnoughShards;
    }

    public buyShardUpgrade(
        typeNum: PokemonType,
        effectNum: GameConstants.TypeEffectiveness
    ): void {
        if (this.canBuyShardUpgrade(typeNum, effectNum)) {
            this.gainShards(-this.getShardUpgradeCost(typeNum, effectNum), typeNum);
            GameHelper.incrementObservable(this.shardUpgrades[typeNum * Shards.nEffects + effectNum]);
        }
    }

    public isValidUpgrade(
        typeNum: PokemonType,
        effectNum: GameConstants.TypeEffectiveness
    ): boolean {
        return !!this.validUpgrades[typeNum]?.[effectNum];
    }

    public getShardUpgrade(
        typeNum: PokemonType,
        effectNum: GameConstants.TypeEffectiveness
    ): number {
        return this.shardUpgrades[typeNum * Shards.nEffects + effectNum]();
    }

    initialize() {
        // Storing Shards for easy access
        Object.values(ItemList).filter(Shard.isShard).forEach(shard => {
            this.shards[shard.type] = shard;
        });
    }

    canAccess(): boolean {
        return App.game.keyItems.hasKeyItem(KeyItems.KeyItem.Shard_case);
    }

    update(delta: number) {
    }

    toJSON(): Record<string, any> {
        return {
            'shardUpgrades': this.shardUpgrades.map(ko.unwrap),
        };
    }

    fromJSON(json: Record<string, any>) {
        if (json != null) {
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
