class IncubatorFuel {

    public itemAmount: KnockoutComputed<number>;

    constructor(public id: IncubatorFuelType,
        public item: BagItem,
        public fuelAmount: number,
        public research?: Lab.Research) {

    }

}
