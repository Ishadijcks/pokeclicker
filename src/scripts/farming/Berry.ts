///<reference path="./BerryType.ts"/>

interface BerryFlavor {
    type: FlavorType,
    value: number,
}

class Berry {
    public type: BerryType;
    public growthTime: number[];
    public harvestAmount: number;
    public replantRate: number;
    public farmValue: number;

    public flavors: BerryFlavor[];
    public color: BerryColor;

    constructor(type: BerryType, growthTime: number[], harvestAmount: number,
        replantRate: number, farmValue: number,
        flavors: number[], color: BerryColor) {
        this.type = type;
        this.growthTime = growthTime;
        this.harvestAmount = harvestAmount;
        this.replantRate = replantRate;
        this.farmValue = farmValue;
        this.flavors = [];
        for (let i = 0;i < 5;i++) {
            this.flavors.push({type: i, value: flavors[i]});
        }
        this.color = color;
    }
}
