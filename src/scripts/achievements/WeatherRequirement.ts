///<reference path="Requirement.ts"/>

class WeatherRequirement extends Requirement {

    private weather: WeatherType[];

    constructor(weather: WeatherType[], type: GameConstants.AchievementOption = GameConstants.AchievementOption.equal) {
        super(1, type);
        this.weather = weather;
    }

    public getProgress(): number {
        return +this.weather.includes(Weather.currentWeather());
    }

    public hint(): string {
        return `The weather needs to be ${WeatherType[this.requiredValue]}.`;
    }
}
