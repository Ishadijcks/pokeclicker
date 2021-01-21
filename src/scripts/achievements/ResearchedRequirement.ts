///<reference path="Requirement.ts"/>

class ResearchedRequirement extends Requirement {
    public research: Lab.Research;
    constructor(
        research: Lab.Research,
        type: GameConstants.AchievementOption = GameConstants.AchievementOption.more
    ) {
        super(1, type);
        this.research = research;
    }

    public getProgress() {
        return +App.game.lab.researchList.find(res => res.id === this.research).completed;
    }

    public hint(): string {
        return `Requires completing the ${App.game.lab.researchList.find(res => res.id === this.research).name} Research.`;
    }
}
