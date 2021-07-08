class GeneratorFuel {

    public itemAmount: KnockoutComputed<number>;

    constructor(public id: GeneratorFuelType,
        public item: BagItem,
        public fuelAmount: number,
        public research?: Lab.Research) {

    }

}
