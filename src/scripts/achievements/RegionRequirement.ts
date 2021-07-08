///<reference path="Requirement.ts"/>

class RegionRequirement extends Requirement {
    constructor(
        region: GameConstants.Region,
        type: GameConstants.AchievementOption = GameConstants.AchievementOption.more
    ) {
        super(region, type);
    }

    public getProgress() {
        return player.highestRegion();
    }

    public hint(): string {
        return `Requires traveling to the ${GameConstants.camelCaseToString(GameConstants.Region[this.requiredValue])} Region.`;
    }
}
