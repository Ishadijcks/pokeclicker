/// <reference path="../../declarations/achievements/Requirement.d.ts" />

class CaughtPokemonRequirement extends Requirement {
    constructor(value: number, type: GameConstants.AchievementOption = GameConstants.AchievementOption.more) {
        super(value, type);
    }

    public getProgress() {
        return Math.min(App.game.party.caughtPokemon.filter(p => p.id > 0).length, this.requiredValue);
    }

    public hint(): string {
        return `${this.requiredValue} unique Pokémon need to be caught.`;
    }
}
