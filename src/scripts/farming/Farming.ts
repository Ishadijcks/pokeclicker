/// <reference path="../../declarations/GameHelper.d.ts" />
/// <reference path="../../declarations/DataStore/common/Feature.d.ts" />

class Farming implements Feature {
    name = 'Farming';
    saveKey = 'farming';

    berryData: Berry[] = [];
    mutations: Mutation[] = [];

    externalAuras: KnockoutObservable<number>[];

    mutationCounter = 0;
    wanderCounter = 0;

    // You may be wondering why this is necessary.
    // It turns out for some reason the plot age doesn't update in time in the same tick.
    // This means that if we attempt to reset the auras in the same tick, the plant that changed stages
    // will still act like it's in the previous stage, which means the wrong aura is applied.
    // Queueing an aura reset in later ticks fixes this issue, and is barely noticable to the player.
    queuedAuraReset = -1;

    static readonly PLOT_WIDTH = 5;
    static readonly PLOT_HEIGHT = 5;

    defaults = {
        berryList: Array<number>(GameHelper.enumLength(BerryType) - 1).fill(0),
        unlockedBerries: Array<boolean>(GameHelper.enumLength(BerryType) - 1).fill(false),
        mulchList: Array<number>(GameHelper.enumLength(MulchType)).fill(0),
        plotList: new Array(Farming.PLOT_WIDTH * Farming.PLOT_HEIGHT).fill(null).map((value, index) => {
            const middle = Math.floor(Farming.PLOT_HEIGHT / 2) * Farming.PLOT_WIDTH + Math.floor(Farming.PLOT_WIDTH / 2);
            return new Plot(index === middle, BerryType.None, 0, MulchType.None, 0);
        }),
        shovelAmt: 0,
    };

    berryList: KnockoutObservable<number>[];
    unlockedBerries: KnockoutObservable<boolean>[];
    mulchList: KnockoutObservable<number>[];
    plotList: Array<Plot>;
    shovelAmt: KnockoutObservable<number>;

    highestUnlockedBerry: KnockoutComputed<number>;

    constructor(private multiplier: Multiplier) {
        this.berryList = this.defaults.berryList.map((v) => ko.observable<number>(v));
        this.unlockedBerries = this.defaults.unlockedBerries.map((v) => ko.observable<boolean>(v));
        this.mulchList = this.defaults.mulchList.map((v) => ko.observable<number>(v));
        this.plotList = this.defaults.plotList;
        this.shovelAmt = ko.observable(this.defaults.shovelAmt);

        this.externalAuras = [];
        this.externalAuras[AuraType.Attract] = ko.observable<number>(1);
        this.externalAuras[AuraType.Egg] = ko.observable<number>(1);
        this.externalAuras[AuraType.Shiny] = ko.observable<number>(1);

        this.multiplier.addBonus('shiny', () => this.externalAuras[AuraType.Shiny]());
        this.multiplier.addBonus('eggStep', () => this.externalAuras[AuraType.Egg]());

        this.highestUnlockedBerry = ko.pureComputed(() => {
            for (let i = GameHelper.enumLength(BerryType) - 2; i >= 0; i--) {
                if (this.unlockedBerries[i]()) {
                    return i;
                }
            }
            return 0;
        });
    }

    initialize(): void {

        //#region Berry Data

        //#region First Generation
        this.berryData[BerryType.Cheri]     = new Berry(BerryType.Cheri,    [5,10,20,30,60],
            2, 0.5, 5, 1,
            [10, 0, 0, 0, 0], BerryColor.Red,
            ['This bright red Berry is very spicy and has a provocative flavor. It blooms with delicate, pretty flowers.']);
        this.berryData[BerryType.Chesto]    = new Berry(BerryType.Chesto,   [5, 15, 25, 40, 80],
            3, 0.5, 6, 2,
            [0, 10, 0, 0, 0], BerryColor.Purple,
            ['This Berry\'s thick skin and fruit are very tough and dry tasting. However, every bit of it can be eaten.']);
        this.berryData[BerryType.Pecha]     = new Berry(BerryType.Pecha,    [10, 35, 50, 60, 120],
            4, 0.5, 7, 3,
            [0, 0, 10, 0, 0], BerryColor.Pink,
            ['Because of its hollow inside pocket, there isn\'t a lot to eat. What can be eaten is very sweet and delicious']);
        this.berryData[BerryType.Rawst]     = new Berry(BerryType.Rawst,    [15, 30, 45, 80, 160],
            5, 0.5, 8, 4,
            [0, 0, 0, 10, 0], BerryColor.Green,
            ['If the leaves grow longer and curlier than average, this Berry will have a somewhat-bitter taste.']);
        this.berryData[BerryType.Aspear]    = new Berry(BerryType.Aspear,   [10, 40, 60, 120, 240],
            6, 0.5, 9, 5,
            [0, 0, 0, 0, 10], BerryColor.Yellow,
            ['This Berry\'s peel is hard, but the flesh inside is very juicy. It is distinguished by its bracing sourness.']);
        this.berryData[BerryType.Leppa]     = new Berry(BerryType.Leppa,    [100, 120, 140, 240, 480],
            7, 0.5, 10, 6,
            [10, 0, 10, 10, 10], BerryColor.Red,
            ['It takes longer to grow than Berries such as Cheri. The smaller Berries taste better.']);
        this.berryData[BerryType.Oran]      = new Berry(BerryType.Oran,     [120, 180, 240, 300, 600],
            8, 0.5, 20, 7,
            [10, 10, 0, 10, 10], BerryColor.Blue,
            ['Nature\'s gifts came together as one in this Berry. It has a wondrous mix of flavors that spread in the mouth.']);
        this.berryData[BerryType.Sitrus]    = new Berry(BerryType.Sitrus,   [150, 300, 450, 600, 1200],
            9, 0.5, 30, 8,
            [0, 10, 10, 10, 10], BerryColor.Yellow,
            ['Sitrus came from the same family as Oran. It is larger and smoother tasting than Oran.']);
        //#endregion

        //#region Second Generation
        this.berryData[BerryType.Persim]    = new Berry(BerryType.Persim,   [20, 40, 50, 90, 180],
            5, 0.4, 10, 2,
            [10, 10, 10, 0, 10], BerryColor.Pink,
            ['The more this Berry absorbs energy from sunlight, the more vividly colorful it grows.']);
        this.berryData[BerryType.Razz]      = new Berry(BerryType.Razz,     [100, 150, 200, 250, 500],
            7, 0.4, 15, 2,
            [10, 10, 0, 0, 0], BerryColor.Red,
            ['A small hint of spiciness lingers in the red granules surrounding this Berry. Their centers have a dry taste.']);
        this.berryData[BerryType.Bluk]      = new Berry(BerryType.Bluk,     [200, 250, 300, 330, 660],
            9, 0.4, 20, 2,
            [0, 10, 10, 0, 0], BerryColor.Purple,
            ['Though this small, delicately skinned Berry is blue in color, it dyes the mouth black when eaten.']);
        this.berryData[BerryType.Nanab]     = new Berry(BerryType.Nanab,    [25, 30, 35, 250, 500],
            11, 0.4, 25, 2,
            [0, 0, 10, 10, 0], BerryColor.Pink,
            ['Bitter, but with a trace of sweetness, the Nanab Berry was the seventh to be discovered in the world.']);
        this.berryData[BerryType.Wepear]    = new Berry(BerryType.Wepear,   [150, 350, 375, 400, 800],
            12, 0.4, 30, 2,
            [0, 0, 0, 10, 10], BerryColor.Green,
            ['The potent mix of bitter and sour in this Berry seems to promote digestion. The flower is white and beautiful.']);
        this.berryData[BerryType.Pinap]     = new Berry(BerryType.Pinap,    [30, 60, 180, 240, 480],
            13, 0.4, 35, 2,
            [10, 0, 0, 0, 10], BerryColor.Yellow,
            ['It is said that when the sour skin is peeled, this spicy Berry can be crushed to make medicine.']);

        this.berryData[BerryType.Figy]      = new Berry(BerryType.Figy,     [40, 160, 230, 350, 700],
            14, 0.3, 40, 3,
            [15, 0, 0, 0, 0], BerryColor.Red,
            ['This Berry is oddly shaped, appearing as if someone took a bite out of it. It is packed full of spicy substances.']);
        this.berryData[BerryType.Wiki]      = new Berry(BerryType.Wiki,     [40, 190, 210, 360, 720],
            15, 0.3, 45, 3,
            [0, 15, 0, 0, 0], BerryColor.Purple,
            ['It is said that this Berry grew lumps to help Pokémon grip it, allowing propagation farther afield.']);
        this.berryData[BerryType.Mago]      = new Berry(BerryType.Mago,     [40, 180, 240, 370, 740],
            16, 0.3, 50, 3,
            [0, 0, 15, 0, 0], BerryColor.Pink,
            ['This Berry progressively curves as it grows. The curvier the Berry, the sweeter and tastier.']);
        this.berryData[BerryType.Aguav]     = new Berry(BerryType.Aguav,    [40, 170, 220, 350, 700],
            17, 0.3, 55, 3,
            [0, 0, 0, 15, 0], BerryColor.Green,
            ['This Berry turns bitter toward the stem. The dainty flower it grows from doesn\'t absorb much sunlight.']);
        this.berryData[BerryType.Iapapa]    = new Berry(BerryType.Iapapa,   [40, 200, 230, 380, 760],
            18, 0.3, 60, 3,
            [0, 0, 0, 0, 15], BerryColor.Yellow,
            ['This Berry is very big and sour. The juiciness of the pulp accentuates the sourness.']);

        this.berryData[BerryType.Lum]       = new Berry(BerryType.Lum,      [3000, 3200, 3400, 3600, 43200],
            1, 0, 1000, 3,
            [10, 10, 10, 10, 0], BerryColor.Green,
            [
                'This Berry\'s gradual process of storing nutrients beneficial to Pokémon health causes it to mature slowly.',
                'This Berry multiplies the effect of Berry plants around it.',
            ], new Aura(AuraType.Boost, [1.01, 1.02, 1.03]));
        //#endregion

        //#region Third Generation
        this.berryData[BerryType.Pomeg]     = new Berry(BerryType.Pomeg,    [200, 1200, 4000, 5400, 10800],
            20, 0.2, 500, 10,
            [10, 0, 10, 10, 0], BerryColor.Red,
            ['When this sweetly spicy Berry\'s thick skin is peeled, many pieces of the fruit spill out.']);
        this.berryData[BerryType.Kelpsy]    = new Berry(BerryType.Kelpsy,   [240, 2000, 3400, 6000, 12000],
            21, 0.2, 525, 10,
            [0, 10, 0, 10, 10], BerryColor.Blue,
            ['This Berry can be eaten as is or boiled to obtain an extract that adds a dash of flavor to food.']);
        this.berryData[BerryType.Qualot]    = new Berry(BerryType.Qualot,   [230, 1000, 2500, 4800, 9600],
            22, 0.2, 550, 10,
            [10, 0, 10, 0, 10], BerryColor.Yellow,
            ['Even in places of constant rain and high humidity, this Berry\'s plant grows healthy and strong.']);
        this.berryData[BerryType.Hondew]    = new Berry(BerryType.Hondew,   [1000, 2000, 5000, 10800, 21600],
            23, 0.2, 2000, 10,
            [10, 10, 0, 10, 0], BerryColor.Green,
            ['This somewhat-rare Berry projects an image of luxury, so it is favored as a gift item.']);
        this.berryData[BerryType.Grepa]     = new Berry(BerryType.Grepa,    [300, 3400, 5600, 7200, 14400],
            24, 0.2, 600, 10,
            [0, 10, 10, 0, 10], BerryColor.Yellow,
            ['One bite of this very tender Berry fills the mouth with its sweet and tangy flavor.']);
        this.berryData[BerryType.Tamato]    = new Berry(BerryType.Tamato,   [430, 1400, 4000, 8640, 17280],
            25, 0.2, 625, 10,
            [20, 10, 0, 0, 0], BerryColor.Red,
            ['This Berry is large and spicy. When eaten during the cold season, it warms the body from inside.']);

        this.berryData[BerryType.Cornn]     = new Berry(BerryType.Cornn,    [1100, 4000, 8000, 9000, 18000],
            26, 0.1, 700, 10,
            [0, 20, 10, 0, 0], BerryColor.Purple,
            ['Its dryness is quite strong. As a result, its true deliciousness can\'t be appreciated by just eating one or two.']);
        this.berryData[BerryType.Magost]    = new Berry(BerryType.Magost,   [2400, 6500, 10000, 14400, 28800],
            27, 0.1, 750, 10,
            [0, 0, 20, 10, 0], BerryColor.Pink,
            ['The grown-up flavor and dreamy sweetness of this Berry make it a favorite of Pokémon everywhere.']);
        this.berryData[BerryType.Rabuta]    = new Berry(BerryType.Rabuta,   [2310, 5400, 9500, 12240, 24480],
            28, 0.1, 800, 10,
            [0, 0, 0, 20, 10], BerryColor.Green,
            ['Even though it is bitter, it should be eaten peel and all. The hair on the peel cleans the stomach from the inside.']);
        this.berryData[BerryType.Nomel]     = new Berry(BerryType.Nomel,    [1240, 5200, 10500, 15120, 30240],
            29, 0.1, 850, 10,
            [10, 0, 0, 0, 20], BerryColor.Yellow,
            ['This Berry is quite sour overall, with the sourness especially concentrated at the pointed end.']);
        this.berryData[BerryType.Spelon]    = new Berry(BerryType.Spelon,   [2000, 7000, 12000, 15480, 30960],
            30, 0.1, 900, 10,
            [30, 10, 0, 0, 0], BerryColor.Red,
            ['So spicy is the Spelon Berry that, Fire type or not, Pokémon will try to breathe fire after eating a single one.']);
        this.berryData[BerryType.Pamtre]    = new Berry(BerryType.Pamtre,   [3000, 10000, 16400, 18000, 36000],
            31, 0.1, 950, 10,
            [0, 30, 10, 0, 0], BerryColor.Purple,
            ['This Berry drifted from a faraway sea. It is now cultivated in the Sinnoh region.']);
        this.berryData[BerryType.Watmel]    = new Berry(BerryType.Watmel,   [2300, 3400, 9800, 16560, 33120],
            32, 0.1, 1000, 10,
            [0, 0, 30, 10, 0], BerryColor.Pink,
            ['A bounty of nature that is exceedingly sweet. The Berry is huge, with some discovered that exceed 20 inches.']);
        this.berryData[BerryType.Durin]     = new Berry(BerryType.Durin,    [10000, 14000, 18000, 21600, 43200],
            33, 0.1, 1050, 10,
            [0, 0, 0, 30, 10], BerryColor.Green,
            ['This Berry is tremendously bitter. Just one bite is enough to instantly stop hiccups.']);
        this.berryData[BerryType.Belue]     = new Berry(BerryType.Belue,    [5000, 9800, 14500, 19800, 39600],
            20, 0.1, 1100, 10,
            [10, 0, 0, 0, 30], BerryColor.Purple,
            ['This glossy and colorful Berry has a mouthwateringly delicious appearance. However, it is awfully sour.']);
        //#endregion

        //#region Fourth Generation (Typed)
        this.berryData[BerryType.Occa]      = new Berry(BerryType.Occa,     [8090, 13200, 16000, 21960, 43920],
            21, 0.05, 1200, 15,
            [15, 0, 10, 0, 0], BerryColor.Red,
            [
                'This Berry is said to have grown plentiful in the tropics of the past. It boasts an intensely hot spiciness.',
                'It has a tendency to overtake nearby plants.',
            ], undefined, ['Charmander', 'Cyndaquil', 'Torchic', 'Chimchar', 'Tepig']);
        this.berryData[BerryType.Passho]    = new Berry(BerryType.Passho,   [490, 3600, 10800, 21600, 43200],
            22, 0.05, 1300, 15,
            [0, 15, 0, 10, 0], BerryColor.Blue,
            [
                'This Berry\'s flesh is dotted with countless tiny bubbles of air that keep it afloat in water.',
                'This Berry promotes the fruiting of nearby Berry plants.',
            ], new Aura(AuraType.Harvest, [1.1, 1.2, 1.3]), ['Squirtle', 'Totodile', 'Mudkip', 'Piplup', 'Oshawott']);
        this.berryData[BerryType.Wacan]     = new Berry(BerryType.Wacan,    [10, 180, 900, 1800, 3600],
            2, 0.05, 250, 1,
            [0, 0, 15, 0, 10], BerryColor.Yellow,
            [
                'Energy from lightning strikes is drawn into the plant, making the Berries grow big and rich.',
                'The same energy promotes the growth of nearby Berries.',
            ], new Aura(AuraType.Growth, [1.1, 1.2, 1.3]), ['Pikachu']);
        this.berryData[BerryType.Rindo]     = new Berry(BerryType.Rindo,    [3600, 7200, 16200, 28800, 57600],
            24, 0.05, 1400, 15,
            [10, 0, 0, 15, 0], BerryColor.Green,
            [
                'This Berry has a disagreeable "green" flavor and scent typical of vegetables. It is rich in health-promoting fiber.',
                'It has a tendency to expand into nearby plots.',
            ], undefined, ['Bulbasaur', 'Chikorita', 'Treecko', 'Turtwig', 'Snivy']);
        this.berryData[BerryType.Yache]     = new Berry(BerryType.Yache,    [3600, 14400, 28800, 43200, 86400],
            25, 0.05, 1500, 15,
            [0, 10, 0, 0, 15], BerryColor.Blue,
            [
                'This Berry has a refreshing flavor that strikes a good balance of dryness and sourness. It tastes better chilled.',
                'This Berry slows the growth of nearby Berries.',
            ], new Aura(AuraType.Growth, [0.9, 0.8, 0.7]), ['Snover']);
        this.berryData[BerryType.Chople]    = new Berry(BerryType.Chople,   [5400, 10800, 25200, 36000, 72000],
            26, 0.05, 1600, 15,
            [15, 0, 0, 10, 0], BerryColor.Red,
            [
                'This Berry contains a substance that generates heat. It can even heat up a chilly heart.',
                'Growing these Berries will promote Egg growth.',
            ], new Aura(AuraType.Egg, [1.01, 1.02, 1.03]), ['Riolu']);
        this.berryData[BerryType.Kebia]     = new Berry(BerryType.Kebia,    [100, 200, 400, 600, 86400],
            1, 1, 50, 1,
            [0, 15, 0, 0, 10], BerryColor.Green,
            [
                'This Berry is a brilliant green on the outside. Inside, it is packed with a dry-flavored, black-colored flesh.',
                'It has a tendency to overtake nearby plants.',
                'Due to its poisonous nature, it increases the chances of mutations near it.',
            ], new Aura(AuraType.Mutation, [1.2, 1.4, 1.6]), ['Gulpin']);
        this.berryData[BerryType.Shuca]     = new Berry(BerryType.Shuca,    [7200, 16200, 32400, 39600, 79200],
            28, 1, 1700, 15,
            [10, 0, 15, 0, 0], BerryColor.Yellow,
            [
                'The sweetness-laden pulp has just the hint of a hard-edged and fragrant bite to it.',
                'Growing these Berries will soften the ground around it, increasing the chances of replanting.',
            ], new Aura(AuraType.Replant, [1.01, 1.02, 1.03]), ['Larvitar']);
        this.berryData[BerryType.Coba]      = new Berry(BerryType.Coba,     [9000, 12600, 16200, 19800, 39600],
            29, 0.05, 1800, 15,
            [0, 10, 0, 15, 0], BerryColor.Blue,
            ['This Berry is said to be a new kind that is a cross of two Berries brought together by winds from far away.'],
            undefined, ['Tropius']);
        this.berryData[BerryType.Payapa]    = new Berry(BerryType.Payapa,   [4680, 11880, 23400, 34200, 68400],
            30, 0.05, 1900, 15,
            [0, 0, 10, 0, 15], BerryColor.Purple,
            [
                'This Berry is said to sense human emotions for the way it swells roundly when a person approaches.',
                'The same behavior affects nearby plants, causing additional mutations.',
            ], new Aura(AuraType.Mutation, [1.1, 1.2, 1.3]), ['Natu']);
        this.berryData[BerryType.Tanga]     = new Berry(BerryType.Tanga,    [450, 900, 1800, 3600, 7200],
            3, 0.5, 500, 15,
            [20, 0, 0, 0, 10], BerryColor.Green,
            [
                'The flower grows at the tip of this Berry. It attracts Bug Pokémon by letting its stringy petals stream out.',
                'The attracted Bug Pokémon decreases the amount of harvestable Berries in nearby plants',
            ], new Aura(AuraType.Harvest, [0.9, 0.8, 0.7]), ['Nincada']);
        this.berryData[BerryType.Charti]    = new Berry(BerryType.Charti,   [8600, 12960, 23040, 37800, 75600],
            32, 0.05, 2000, 15,
            [10, 20, 0, 0, 0], BerryColor.Yellow,
            [
                'It is often used for pickles because of its very dry flavor. It can also be eaten raw for its provocative taste.',
                'This Berry plant hardens the surrounding soil, decreasing the chances of replanting.',
            ], new Aura(AuraType.Replant, [0.99, 0.98, 0.97]), ['Sudowoodo']);
        this.berryData[BerryType.Kasib]     = new Berry(BerryType.Kasib,    [30, 60, 120, 300, 86400],
            1, 1, 25, 1,
            [0, 10, 20, 0, 0], BerryColor.Purple,
            [
                'Considered to have a special power from the olden days, this Berry is sometimes dried and used as a good-luck charm.',
                'This Berry causes other nearby Berries to wither away faster.',
            ], new Aura(AuraType.Death, [1.25, 1.5, 2.0]), ['Shedinja']);
        this.berryData[BerryType.Haban]     = new Berry(BerryType.Haban,    [10800, 21600, 43200, 86400, 172800],
            34, 0, 4000, 15,
            [0, 0, 10, 20, 0], BerryColor.Red,
            [
                'If a large enough volume of this Berry is boiled down, its bitterness fades away. It makes a good jam.',
                'This Berry requires a lot of energy to grow, stealing away nutrients from nearby plots.',
            ], new Aura(AuraType.Growth, [0.8, 0.6, 0.5]), ['Bagon']);
        this.berryData[BerryType.Colbur]    = new Berry(BerryType.Colbur,   [2880, 10080, 19440, 27000, 54000],
            35, 0.05, 2300, 15,
            [0, 0, 0, 10, 20], BerryColor.Purple,
            [
                'Tiny hooks grow on the surface of this Berry. It latches on to Pokémon so it can be carried to far-off places.',
                'It has a tendency to overtake nearby plants.',
            ], undefined, ['Absol']);
        this.berryData[BerryType.Babiri]    = new Berry(BerryType.Babiri,   [7200, 16200, 32400, 64800, 129600],
            36, 0.05, 2400, 15,
            [25, 10, 0, 0, 0], BerryColor.Green,
            [
                'This Berry is very tough with a strong flavor. It was used to make medicine by people in the past.',
                'This Berry plant is very hardy and resistant, making it resistant to mutations, and also decreasing the chance of mutations around it.',
            ], new Aura(AuraType.Mutation, [0.5, 0.25, 0.0]), ['Skarmory']);
        this.berryData[BerryType.Chilan]    = new Berry(BerryType.Chilan,   [240, 1430, 2970, 7200, 14400],
            10, 0.05, 500, 15,
            [0, 25, 10, 0, 0], BerryColor.Yellow,
            ['This Berry can be cored out and dried to make a whistle. Blowing through its hole makes an indescribable sound.']);
        this.berryData[BerryType.Roseli]    = new Berry(BerryType.Roseli,   [2410, 5040, 12600, 25200, 50400],
            38, 0.05, 2500, 15,
            [0, 0, 25, 10, 0], BerryColor.Pink,
            [
                'This Berry is sweet with a hint of bitterness and has a lingering sweet scent. It is often dried and used to make tea.',
                'The scent of this Berry plant attracts wild Pokémon.',
            ], new Aura(AuraType.Attract, [1.01, 1.02, 1.03]), ['Togepi']);
        //#endregion

        //#region Fifth Generation
        this.berryData[BerryType.Micle]     = new Berry(BerryType.Micle,    [3960, 7920, 15840, 31680, 63360],
            1, 0.05, 2600, 20,
            [0, 40, 10, 0, 0], BerryColor.Green,
            ['This Berry has a very dry flavor. It has the effect of making other food eaten at the same time taste sweet.']);
        this.berryData[BerryType.Custap]    = new Berry(BerryType.Custap,   [3240, 8280, 13320, 27360, 54720],
            1, 0.05, 2700, 20,
            [0, 0, 40, 10, 0], BerryColor.Red,
            ['The flesh underneath the Custap Berry\'s tough skin is sweet and creamy soft.']);
        this.berryData[BerryType.Jaboca]    = new Berry(BerryType.Jaboca,   [4320, 8640, 16560, 33480, 66960],
            1, 0.05, 2800, 20,
            [0, 0, 0, 40, 10], BerryColor.Yellow,
            [
                'The cluster of drupelets that make up this Berry pop rhythmically if the Berry is handled roughly.',
                'The sound of these Berries attracts wild Pokémon.',
            ]);
        this.berryData[BerryType.Rowap]     = new Berry(BerryType.Rowap,    [5760, 9000, 14040, 21240, 42480],
            1, 0.05, 2900, 20,
            [10, 0, 0, 0, 40], BerryColor.Blue,
            ['In days of old, people worked the top-shaped pieces of this Berry free and used them as toys.']);
        this.berryData[BerryType.Kee]       = new Berry(BerryType.Kee,      [4680, 9360, 18360, 36360, 72720],
            1, 0.05, 3000, 20,
            [30, 30, 10, 10, 10], BerryColor.Yellow,
            ['This Berry remains poisonous until fully ripened. Once ripe it has a spicy and sweet complex flavor.']);
        this.berryData[BerryType.Maranga]   = new Berry(BerryType.Maranga,  [5040, 10080, 20160, 40320, 80640],
            1, 0.05, 3100, 20,
            [10, 10, 30, 30, 10], BerryColor.Blue,
            ['This Berry resembles the Durin Berry, however its spikes are less pronounced. It is quite delicious when roasted.']);

        this.berryData[BerryType.Liechi]    = new Berry(BerryType.Liechi,   [21600, 43200, 86400, 172800, 345600],
            0.5, 0, 10000, 20,
            [30, 10, 30, 0, 0], BerryColor.Red,
            ['This Berry is surrounded by mystery. It is rumored to be imbued with the power of the sea.'],
            undefined, ['Manaphy']);
        this.berryData[BerryType.Ganlon]    = new Berry(BerryType.Ganlon,   [21600, 43200, 86400, 172800, 345600],
            0.5, 0, 10000, 20,
            [0, 30, 10, 30, 0], BerryColor.Purple,
            ['This Berry is surrounded by mystery. It is rumored to be imbued with the power of the land.']);
        this.berryData[BerryType.Salac]     = new Berry(BerryType.Salac,    [21600, 43200, 86400, 172800, 345600],
            0.5, 0, 10000, 20,
            [0, 0, 30, 10, 30], BerryColor.Green,
            ['This Berry is surrounded by mystery. It is rumored to be imbued with the power of the sky.']);
        this.berryData[BerryType.Petaya]    = new Berry(BerryType.Petaya,   [10800, 21600, 43200, 86400, 432000],
            0.5, 0, 15000, 20,
            [30, 0, 0, 30, 10], BerryColor.Pink,
            [
                'This Berry is surrounded by mystery. It is rumored to be imbued with the power of all living things.',
                'This power keeps other Berries alive for longer.',
            ],
            undefined, ['Mew']);
        this.berryData[BerryType.Apicot]    = new Berry(BerryType.Apicot,   [10800, 21600, 43200, 86400, 432000],
            0.5, 0, 15000, 20,
            [10, 30, 0, 0, 30], BerryColor.Blue,
            ['This is a very, very mystifying Berry. There is no telling how it can be used, or what may happen if it is used.']);
        this.berryData[BerryType.Lansat]    = new Berry(BerryType.Lansat,   [10800, 21600, 43200, 86400, 432000],
            0.5, 0, 15000, 20,
            [30, 10, 30, 10, 30], BerryColor.Red,
            ['This is said to be a legendary Berry. Holding it supposedly brings great joy.']);
        this.berryData[BerryType.Starf]     = new Berry(BerryType.Starf,    [10800, 21600, 43200, 86400, 432000],
            0.5, 0, 15000, 20,
            [30, 10, 30, 10, 30], BerryColor.Green,
            ['This Berry is considered a mirage. It was said to be so strong that it had to be abandoned at the world\'s edge.'],
            new Aura(AuraType.Shiny, [1.005, 1.01, 1.015]), ['Jirachi']);

        this.berryData[BerryType.Enigma]    = new Berry(BerryType.Enigma,   [10800, 21600, 43200, 86400, 604800],
            0.5, 0, 15000, 20,
            [40, 10, 0, 0, 0], BerryColor.Purple,
            ['A completely enigmatic Berry. It apparently has the power of the stars that fill the night sky.']);
        //#endregion

        //#endregion

        //#region Mutations

        /**
         * NOTE: ONLY ADD NEW MUTATIONS AT THE END OF THE LIST. MUTATION INDEX IS USED TO STORE HINT SEEN DATA
         */

        //#region Second Generation

        // Persim
        this.mutations.push(new GrowNearBerryMutation(.02, BerryType.Persim,
            [
                BerryType.Pecha,
                BerryType.Oran,
            ]));
        // Razz
        this.mutations.push(new GrowNearBerryMutation(.019, BerryType.Razz,
            [
                BerryType.Cheri,
                BerryType.Leppa,
            ]));
        // Bluk
        this.mutations.push(new GrowNearBerryMutation(.018, BerryType.Bluk,
            [
                BerryType.Chesto,
                BerryType.Leppa,
            ]));
        // Nanab
        this.mutations.push(new GrowNearBerryMutation(.017, BerryType.Nanab,
            [
                BerryType.Pecha,
                BerryType.Aspear,
            ]));
        // Wepear
        this.mutations.push(new GrowNearBerryMutation(.016, BerryType.Wepear,
            [
                BerryType.Rawst,
                BerryType.Oran,
            ]));
        // Pinap
        this.mutations.push(new GrowNearBerryMutation(.015, BerryType.Pinap,
            [
                BerryType.Sitrus,
                BerryType.Aspear,
            ]));

        // Figy
        this.mutations.push(new GrowNearFlavorMutation(.009, BerryType.Figy,
            [[25, 80], [0, 5], [0, 5], [0, 5], [0, 5]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings get too spicy!',
                unlockReq: function(): boolean {
                    return App.game.farming.unlockedBerries[BerryType.Cheri]();
                },
            }
        ));
        // Wiki
        this.mutations.push(new GrowNearFlavorMutation(.008, BerryType.Wiki,
            [[0, 5], [25, 80], [0, 5], [0, 5], [0, 5]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings get too dry!',
                unlockReq: function(): boolean {
                    return App.game.farming.unlockedBerries[BerryType.Chesto]();
                },
            }
        ));
        // Mago
        this.mutations.push(new GrowNearFlavorMutation(.007, BerryType.Mago,
            [[0, 5], [0, 5], [25, 80], [0, 5], [0, 5]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings get too sweet!',
                unlockReq: function(): boolean {
                    return App.game.farming.unlockedBerries[BerryType.Pecha]();
                },
            }
        ));
        // Aguav
        this.mutations.push(new GrowNearFlavorMutation(.006, BerryType.Aguav,
            [[0, 5], [0, 5], [0, 5], [25, 80], [0, 5]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings get too bitter!',
                unlockReq: function(): boolean {
                    return App.game.farming.unlockedBerries[BerryType.Rawst]();
                },
            }
        ));
        // Iapapa
        this.mutations.push(new GrowNearFlavorMutation(.005, BerryType.Iapapa,
            [[0, 5], [0, 5], [0, 5], [0, 5], [25, 80]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings get too sour!',
                unlockReq: function(): boolean {
                    return App.game.farming.unlockedBerries[BerryType.Aspear]();
                },
            }
        ));

        // Lum
        this.mutations.push(new GrowNearBerryMutation(.001, BerryType.Lum,
            [
                BerryType.Cheri,
                BerryType.Chesto,
                BerryType.Pecha,
                BerryType.Rawst,
                BerryType.Aspear,
                BerryType.Leppa,
                BerryType.Oran,
                BerryType.Sitrus,
            ], {
                hint: 'I\'ve heard that there\'s a legendary Berry that only appears when fully surrounded by unique ripe Berry plants!',
            }));

        //#endregion

        //#region Third Generation

        // Pomeg
        this.mutations.push(new GrowNearBerryMutation(.0005, BerryType.Pomeg,
            [
                BerryType.Iapapa,
                BerryType.Mago,
            ]));
        // Kelpsy
        this.mutations.push(new GrowNearBerryMutation(.0005, BerryType.Kelpsy,
            [
                BerryType.Chesto,
                BerryType.Persim,
            ]));
        // Qualot
        this.mutations.push(new GrowNearFlavorMutation(.0005, BerryType.Qualot,
            [[10, 15], [0, 0], [10, 15], [0, 0], [10, 15]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings match its flavor profile! If I recall, it tasted a little spicy, a little sweet, and a little sour at the same time.',
                unlockReq: function(): boolean {
                    return App.game.farming.unlockedBerries[BerryType.Cheri]() &&
                    App.game.farming.unlockedBerries[BerryType.Pecha]() &&
                    App.game.farming.unlockedBerries[BerryType.Aspear]();
                },
            }));
        // Hondew
        this.mutations.push(new GrowNearFlavorMutation(.0004, BerryType.Hondew,
            [[15, 15], [15, 15], [0, 0], [15, 15], [0, 0]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings match its flavor profile! If I recall, it tasted fairly spicy, dry, and bitter at the same time.',
                unlockReq: function(): boolean {
                    return App.game.farming.unlockedBerries[BerryType.Figy]() &&
                    App.game.farming.unlockedBerries[BerryType.Wiki]() &&
                    App.game.farming.unlockedBerries[BerryType.Aguav]();
                },
            }));
        // Grepa
        this.mutations.push(new GrowNearBerryMutation(.0005, BerryType.Grepa,
            [
                BerryType.Aguav,
                BerryType.Figy,
            ]));
        // Tamato
        this.mutations.push(new EvolveNearBerryMutation(.0005, BerryType.Tamato, BerryType.Razz, [BerryType.Pomeg]));
        // Cornn
        this.mutations.push(new GrowNearBerryMutation(.0003, BerryType.Cornn,
            [
                BerryType.Leppa,
                BerryType.Bluk,
                BerryType.Wiki,
            ]));
        // Magost
        this.mutations.push(new GrowNearBerryMutation(.0003, BerryType.Magost,
            [
                BerryType.Pecha,
                BerryType.Nanab,
                BerryType.Mago,
            ]));
        // Rabuta
        this.mutations.push(new EvolveNearBerryMutation(.0003, BerryType.Rabuta, BerryType.Aspear, [BerryType.Aguav]));
        // Nomel
        this.mutations.push(new GrowNearBerryMutation(.0003, BerryType.Nomel,
            [BerryType.Pinap]));
        // Spelon
        this.mutations.push(new EvolveNearFlavorMutation(.0002, BerryType.Spelon, BerryType.Tamato,
            [[130, 160], [0, 80], [0, 80], [0, 80], [0, 80]], {
                hint: 'I\'ve heard that a Tamato berry will change if its surroundings get extremely spicy!',
            }));
        // Pamtre
        this.mutations.push(new EvolveNearFlavorMutation(.0002, BerryType.Pamtre, BerryType.Cornn,
            [[0, 80], [130, 160], [0, 80], [0, 80], [0, 80]], {
                hint: 'I\'ve heard that a Cornn berry will change if its surroundings get extremely dry!',
            }));
        // Pamtre Overgrow
        this.mutations.push(new GrowNearBerryMutation(.0004, BerryType.Pamtre,
            [BerryType.Pamtre], { showHint: false }));
        // Watmel
        this.mutations.push(new EvolveNearFlavorMutation(.0002, BerryType.Watmel, BerryType.Magost,
            [[0, 80], [0, 80], [130, 160], [0, 80], [0, 80]], {
                hint: 'I\'ve heard that a Magost berry will change if its surroundings get extremely sweet!',
            }));
        // Durin
        this.mutations.push(new EvolveNearFlavorMutation(.0002, BerryType.Durin, BerryType.Rabuta,
            [[0, 80], [0, 80], [0, 80], [130, 160], [0, 80]], {
                hint: 'I\'ve heard that a Rabuta berry will change if its surroundings get extremely bitter!',
            }));
        // Belue
        this.mutations.push(new EvolveNearFlavorMutation(.0002, BerryType.Belue, BerryType.Nomel,
            [[0, 80], [0, 80], [0, 80], [0, 80], [130, 160]], {
                hint: 'I\'ve heard that a Nomel berry will change if its surroundings get extremely sour!',
            }));

        //#endregion

        //#region Fourth Generation

        // Occa
        this.mutations.push(new GrowNearBerryMutation(.0001, BerryType.Occa,
            [
                BerryType.Razz,
                BerryType.Figy,
                BerryType.Tamato,
                BerryType.Spelon,
            ]));
        // Occa Parasite
        this.mutations.push(new ParasiteMutation(.0004, BerryType.Occa));
        // Passho
        this.mutations.push(new GrowNearBerryMutation(.0001, BerryType.Passho,
            [
                BerryType.Oran,
                BerryType.Chesto,
                BerryType.Kelpsy,
                BerryType.Coba,
            ]));
        // Wacan
        this.mutations.push(new GrowNearBerryMutation(.0001, BerryType.Wacan,
            [
                BerryType.Pinap,
                BerryType.Iapapa,
                BerryType.Qualot,
                BerryType.Grepa,
            ]));
        // Rindo
        // TODO: HLXII - Change mutation to grow spontaneously when Grass pokemon in party
        this.mutations.push(new GrowNearFlavorMutation(.0001, BerryType.Rindo,
            [[10, 15], [0, 0], [0, 0], [15, 20], [0, 0]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings match its flavor profile! If I recall, it tasted a little spicy and fairly bitter at the same time.',
                unlockReq: function(): boolean {
                    return App.game.farming.unlockedBerries[BerryType.Aguav]() &&
                    App.game.farming.unlockedBerries[BerryType.Cheri]();
                },
            }));
        // Rindo Overgrow
        this.mutations.push(new GrowNearBerryMutation(.0004, BerryType.Rindo, [BerryType.Rindo], {showHint: false }));
        // Yache
        this.mutations.push(new EvolveNearBerryStrictMutation(.0001, BerryType.Yache, BerryType.Passho, {}, PlotStage.Seed, {
            hint: 'I\'ve heard that growing a Passho Berry alone will cause it to change!',
        }));
        // Chople
        this.mutations.push(new OakMutation(.0001, BerryType.Chople, BerryType.Spelon, OakItems.OakItem.Blaze_Cassette));
        // Kebia
        this.mutations.push(new OakMutation(.0001, BerryType.Kebia, BerryType.Pamtre, OakItems.OakItem.Poison_Barb));
        // Kebia Parasite
        this.mutations.push(new ParasiteMutation(.0004, BerryType.Kebia));
        // Shuca
        this.mutations.push(new OakMutation(.0001, BerryType.Shuca, BerryType.Watmel, OakItems.OakItem.Sprinklotad));
        // Coba
        // TODO: HLXII - Change mutation to grow spontaneously when Flying pokemon in party
        this.mutations.push(new GrowNearFlavorMutation(.0001, BerryType.Coba,
            [[0, 0], [10, 15], [0, 0], [15, 20], [0, 0]], {
                hint: 'I\'ve heard that a special Berry can appear if its surroundings match its flavor profile! If I recall, it tasted a little dry and fairly bitter at the same time.',
                unlockReq: function(): boolean {
                    return App.game.farming.unlockedBerries[BerryType.Chesto]() &&
                    App.game.farming.unlockedBerries[BerryType.Aguav]();
                },
            }));
        // Payapa
        this.mutations.push(new GrowNearBerryMutation(.0001, BerryType.Payapa,
            [
                BerryType.Wiki,
                BerryType.Bluk,
                BerryType.Cornn,
                BerryType.Pamtre,
            ]));
        // Tanga
        let berryReqs = {};
        berryReqs[BerryType.Rindo] = 8;
        this.mutations.push(new GrowNearBerryStrictMutation(.0001, BerryType.Tanga, berryReqs, {
            hint: 'I\'ve heard that a special Berry can appear after being surrounded by Rindo Berries!',
        }));
        // Charti
        this.mutations.push(new OakMutation(.0001, BerryType.Charti, BerryType.Cornn, OakItems.OakItem.Cell_Battery));
        // Kasib
        // No mutation, will check withers
        // Haban
        this.mutations.push(new GrowNearBerryMutation(.0001, BerryType.Haban,
            [
                BerryType.Occa,
                BerryType.Rindo,
                BerryType.Passho,
                BerryType.Wacan,
            ]));
        // Colbur
        this.mutations.push(new GrowNearBerryMutation(.0001, BerryType.Colbur,
            [
                BerryType.Rabuta,
                BerryType.Kasib,
                BerryType.Payapa,
            ]));
        // Colbur Parasite
        this.mutations.push(new ParasiteMutation(.0004, BerryType.Colbur));
        // Babiri
        berryReqs = {};
        berryReqs[BerryType.Shuca] = 4;
        berryReqs[BerryType.Charti] = 4;
        this.mutations.push(new GrowNearBerryStrictMutation(.0001, BerryType.Babiri, berryReqs, {
            hint: 'I\'ve heard that a special Berry can appear after being surrounded by Shuca and Charti Berries!',
        }));
        // Chilan
        berryReqs = {};
        berryReqs[BerryType.Chople] = 3;
        this.mutations.push(new EvolveNearBerryMinMutation(.0001, BerryType.Chilan, BerryType.Chople, berryReqs, {
            hint: 'I\'ve heard that Chople Berries will turn into a different Berry if surrounded by more than two of its own kind',
        }));
        // Roseli
        this.mutations.push(new GrowNearBerryMutation(.0001, BerryType.Roseli,
            [
                BerryType.Mago,
                BerryType.Nanab,
                BerryType.Magost,
                BerryType.Watmel,
            ]));
        //#endregion

        //#region Fifth Generation

        // Micle
        this.mutations.push(new FieldFlavorMutation(.0003, BerryType.Micle, [0, 600, 0, 0, 0], {
            hint: 'I\'ve heard of a Berry that only appears in the driest of fields.',
            unlockReq: () => App.game.farming.unlockedBerries[BerryType.Pamtre](),
        }));
        // Custap
        this.mutations.push(new FieldFlavorMutation(.0003, BerryType.Custap, [0, 0, 600, 0, 0], {
            hint: 'I\'ve heard of a Berry that only appears in the sweetest of fields.',
            unlockReq: () => App.game.farming.unlockedBerries[BerryType.Watmel](),
        }));
        // Jaboca
        this.mutations.push(new FieldFlavorMutation(.0003, BerryType.Jaboca, [0, 0, 0, 600, 0], {
            hint: 'I\'ve heard of a Berry that only appears in the most bitter of fields.',
            unlockReq: () => App.game.farming.unlockedBerries[BerryType.Durin](),
        }));
        // Rowap
        this.mutations.push(new FieldFlavorMutation(.0003, BerryType.Rowap, [0, 0, 0, 0, 600], {
            hint: 'I\'ve heard of a Berry that only appears in the most sour of fields.',
            unlockReq: () => App.game.farming.unlockedBerries[BerryType.Belue](),
        }));
        // Kee
        this.mutations.push(new GrowNearBerryMutation(.0003, BerryType.Kee,
            [
                BerryType.Liechi,
                BerryType.Ganlon,
            ]));
        // Maranga
        this.mutations.push(new GrowNearBerryMutation(.0003, BerryType.Maranga,
            [
                BerryType.Salac,
                BerryType.Petaya,
            ]));

        // Liechi
        this.mutations.push(new FieldMutation(.00001, BerryType.Liechi, BerryType.Passho, undefined, {
            unlockReq: () => App.game?.statistics?.pokemonCaptured[PokemonHelper.getPokemonByName('Kyogre').id](),
        }));
        // Ganlon
        this.mutations.push(new FieldMutation(.00001, BerryType.Ganlon, BerryType.Shuca, undefined, {
            unlockReq: () => App.game?.statistics?.pokemonCaptured[PokemonHelper.getPokemonByName('Groudon').id](),
        }));
        // Salac
        this.mutations.push(new FieldMutation(.00001, BerryType.Salac, BerryType.Coba, undefined, {
            unlockReq: () => App.game?.statistics?.pokemonCaptured[PokemonHelper.getPokemonByName('Rayquaza').id](),
        }));
        // Petaya
        this.mutations.push(new PetayaMutation(.00001));
        // Apicot
        // TODO: HLXII - Add Mutation to randomly generate Apicot when Unown spelling APICOT in party.
        // Lansat
        // TODO: HLXII - Add Mutation to evolve Payapa when Milotic, Gardevoir, Blissey, and Togekiss in party.
        // Starf
        // No mutation, obtained by wandering shiny pokemon
        // Enigma
        this.mutations.push(new EnigmaMutation(.0001));
        // Enigma Mutations
        this.mutations.push(new EvolveNearBerryMutation(.0004, BerryType.Liechi, BerryType.Passho, [BerryType.Enigma], {
            showHint: false,
            unlockReq: () => App.game.farming.unlockedBerries[BerryType.Liechi](),
        }));
        this.mutations.push(new EvolveNearBerryMutation(.0004, BerryType.Ganlon, BerryType.Shuca, [BerryType.Enigma], {
            showHint: false,
            unlockReq: () => App.game.farming.unlockedBerries[BerryType.Ganlon](),
        }));
        this.mutations.push(new EvolveNearBerryMutation(.0004, BerryType.Salac, BerryType.Coba, [BerryType.Enigma], {
            showHint: false,
            unlockReq: () => App.game.farming.unlockedBerries[BerryType.Salac](),
        }));
        this.mutations.push(new EvolveNearBerryMutation(.0004, BerryType.Petaya, BerryType.Payapa, [BerryType.Enigma], {
            showHint: false,
            unlockReq: () => App.game.farming.unlockedBerries[BerryType.Petaya](),
        }));
        this.mutations.push(new EvolveNearBerryMutation(.0004, BerryType.Apicot, BerryType.Chilan, [BerryType.Enigma], {
            showHint: false,
            unlockReq: () => App.game.farming.unlockedBerries[BerryType.Apicot](),
        }));
        this.mutations.push(new EvolveNearBerryMutation(.0004, BerryType.Lansat, BerryType.Roseli, [BerryType.Enigma], {
            showHint: false,
            unlockReq: () => App.game.farming.unlockedBerries[BerryType.Lansat](),
        }));
        this.mutations.push(new EvolveNearBerryMutation(.0004, BerryType.Starf, BerryType.Haban, [BerryType.Enigma], {
            showHint: false,
            unlockReq: () => App.game.farming.unlockedBerries[BerryType.Starf](),
        }));

        // Empty Mutations for hints

        // Kasib
        this.mutations.push(new BlankMutation(0, BerryType.Kasib,
            {
                hint: 'I\'ve heard of a Berry that only appears after a Berry plant has withered, but is repelled by Colbur Plants.',
                unlockReq: () => App.game.farming.highestUnlockedBerry() > BerryType.Occa,
            }));

        // Starf
        this.mutations.push(new BlankMutation(0, BerryType.Starf,
            {
                hint: 'I\'ve heard of a Berry that only appears after a Shiny Pokémon wanders near open soil.',
                unlockReq: () => App.game.farming.highestUnlockedBerry() > BerryType.Occa,
            }));

        //#endregion

        //#endregion

    }

    getGrowthMultiplier(): number {
        let multiplier = 1;
        multiplier *= App.game.oakItems.calculateBonus(OakItems.OakItem.Sprayduck);
        return multiplier;
    }

    getReplantMultiplier(): number {
        let multiplier = 1;
        multiplier *= App.game.oakItems.calculateBonus(OakItems.OakItem.Sprinklotad);
        return multiplier;
    }

    getMutationMultiplier(): number {
        let multiplier = 1;
        multiplier *= App.game.oakItems.calculateBonus(OakItems.OakItem.Squirtbottle);
        return multiplier;
    }

    update(delta: number): void {
        const timeToReduce = delta;

        const notifications = new Set<FarmNotificationType>();

        let change = false;

        // Handle updating auras
        if (this.queuedAuraReset >= 0) {
            this.queuedAuraReset -= 1;
            if (this.queuedAuraReset === 0) {
                this.resetAuras();
            }
        }

        // Updating Berries
        this.plotList.forEach(plot => {
            if (plot.update(timeToReduce)) {
                change = true;
            }
            if (plot.notifications) {
                plot.notifications.forEach(n => notifications.add(n));
                plot.notifications = [];
            }
        });

        // Running Mutations
        this.mutationCounter += GameConstants.TICK_TIME;
        if (this.mutationCounter >= GameConstants.MUTATION_TICK) {
            this.mutations.forEach(mutation => {
                if (mutation.mutate()) {
                    GameHelper.incrementObservable(App.game.statistics.totalBerriesMutated, 1);
                    notifications.add(FarmNotificationType.Mutated);
                    change = true;
                }
            });
            this.mutationCounter = 0;
        }

        // Wandering Pokemon
        this.wanderCounter += GameConstants.TICK_TIME;
        let wanderPokemon: any;
        if (this.wanderCounter >= GameConstants.WANDER_TICK) {
            for (let i = 0; i < App.game.farming.plotList.length; i++) {
                const plot = App.game.farming.plotList[i];
                wanderPokemon = plot.generateWanderPokemon();
                if (wanderPokemon !== undefined) {
                    // TODO: HLXII Handle other bonus (DT?)
                    notifications.add(FarmNotificationType.Wander);
                    break;
                }
            }
            this.wanderCounter = 0;

        }

        // Handle queueing aura reset
        if (change) {
            this.queuedAuraReset = 2;
        }

        if (notifications.size) {
            notifications.forEach((n) => this.handleNotification(n, wanderPokemon));
        }
    }

    handleNotification(farmNotiType: FarmNotificationType, wander?: any): void {
        let message = '';
        let type = NotificationConstants.NotificationOption.success;

        switch (farmNotiType) {
            case FarmNotificationType.Ripe:
                message = 'A Berry is ready to harvest!';
                break;
            case FarmNotificationType.AboutToWither:
                message = 'A Berry plant is about to wither!';
                type = NotificationConstants.NotificationOption.warning;
                break;
            case FarmNotificationType.Withered:
                message = 'A Berry plant has withered!';
                type = NotificationConstants.NotificationOption.warning;
                break;
            case FarmNotificationType.Mutated:
                message = 'A Berry plant has mutated!';
                break;
            case FarmNotificationType.Replanted:
                message = 'A Berry has been replanted!';
                break;
            case FarmNotificationType.Dropped:
                message = 'A Berry has been dropped!';
                break;
            case FarmNotificationType.MulchRanOut:
                message = 'A plot has run out of mulch!';
                type = NotificationConstants.NotificationOption.warning;
                break;
            case FarmNotificationType.Wander:
                const pokemon = wander?.shiny ? `shiny ${wander?.pokemon}` : wander?.pokemon;
                message = `A wild ${pokemon} has wandered onto the farm!`;
                type = wander?.shiny ? NotificationConstants.NotificationOption.warning : NotificationConstants.NotificationOption.success;
                break;
        }

        Notifier.notify({
            message,
            type,
            sound: NotificationConstants.NotificationSound.ready_to_harvest,
            setting: NotificationConstants.NotificationSetting.ready_to_harvest,
        });
    }

    resetAuras() {
        this.externalAuras[AuraType.Attract](1);
        this.externalAuras[AuraType.Egg](1);
        this.externalAuras[AuraType.Shiny](1);
        this.plotList.forEach(plot => plot.clearAuras());

        // Handle Boost Auras first
        this.plotList.forEach((plot, idx) => {
            if (plot.berryData?.aura && plot.berryData?.aura.auraType === AuraType.Boost) {
                plot.emitAura(idx);
            }
        });

        // Handle rest of Auras
        this.plotList.forEach((plot, idx) => {
            if (!plot.berryData?.aura || plot.berryData?.aura.auraType !== AuraType.Boost) {
                plot.emitAura(idx);
            }
        });
    }

    //#region Plot Unlocking

    static unlockMatrix = [
        BerryType.Kelpsy, BerryType.Mago, BerryType.Persim, BerryType.Wepear, BerryType.Qualot,
        BerryType.Wiki, BerryType.Aspear, BerryType.Cheri, BerryType.Leppa, BerryType.Aguav,
        BerryType.Nanab, BerryType.Rawst, BerryType.None, BerryType.Chesto, BerryType.Razz,
        BerryType.Pomeg, BerryType.Sitrus, BerryType.Pecha, BerryType.Oran, BerryType.Pinap,
        BerryType.Grepa, BerryType.Figy, BerryType.Bluk, BerryType.Iapapa, BerryType.Hondew,
    ]

    unlockPlot(index: number) {
        if (this.allPlotsUnlocked()) {
            return;
        }
        if (this.canBuyPlot(index)) {
            const berryData = this.plotBerryCost(index);
            GameHelper.incrementObservable(this.berryList[berryData.type], -berryData.amount);
            const cost = this.plotFPCost(index);
            App.game.wallet.loseAmount(new Amount(cost, GameConstants.Currency.farmPoint));
            this.plotList[index].isUnlocked = true;
        }
    }

    allPlotsUnlocked() {
        return this.plotList.every(plot => plot.isUnlocked);
    }

    canBuyPlot(index: number): boolean {
        const berryData = this.plotBerryCost(index);
        if (App.game.farming.berryList[berryData.type]() < berryData.amount) {
            return false;
        }
        const cost = this.plotFPCost(index);
        if (!App.game.wallet.hasAmount(new Amount(cost, GameConstants.Currency.farmPoint))) {
            return false;
        }
        return true;
    }

    plotFPCost(index: number): number {
        const berryType = Farming.unlockMatrix[index];
        return 10 * Math.floor(Math.pow(berryType + 1, 2));
    }

    plotBerryCost(index: number): {type: BerryType, amount: number} {
        const berryType = Farming.unlockMatrix[index];
        return { type: berryType, amount: 10 * (berryType + 1) };
    }

    //#endregion

    plant(index: number, berry: BerryType, suppressResetAura = false) {
        const plot = this.plotList[index];
        if (!plot.isEmpty() || !plot.isUnlocked || !this.hasBerry(berry)) {
            return;
        }

        GameHelper.incrementObservable(this.berryList[berry], -1);
        plot.plant(berry);

        if (!suppressResetAura) {
            this.resetAuras();
        }
    }

    plantAll(berry: BerryType) {
        this.plotList.forEach((plot, index) => {
            this.plant(index, berry, true);
        });
        this.resetAuras();
    }

    /**
     * Harvest a plot at the given index
     * @param index The index of the plot to harvest
     */
    harvest(index: number, suppressResetAura = false): void {
        const plot = this.plotList[index];
        if (plot.berry === BerryType.None || plot.stage() != PlotStage.Berry) {
            return;
        }

        App.game.wallet.gainFarmPoints(this.berryData[plot.berry].farmValue);

        const amount = plot.harvestAmount();

        this.gainBerry(plot.berry, amount);

        App.game.oakItems.use(OakItems.OakItem.Sprayduck, this.berryData[plot.berry].exp);
        GameHelper.incrementObservable(App.game.statistics.totalManualHarvests, 1);

        player.lowerItemMultipliers(MultiplierDecreaser.Berry, this.berryData[plot.berry].exp);

        plot.die(true);

        if (!suppressResetAura) {
            this.resetAuras();
        }
    }

    /**
     * Try to harvest all plots
     */
    public harvestAll() {
        this.plotList.forEach((plot, index) => {
            this.harvest(index, true);
        });
        this.resetAuras();
    }

    /**
     * Handles using the Berry Shovel to remove a Berry plant
     * @param index The plot index
     */
    public shovel(index: number): void {
        const plot = this.plotList[index];
        if (!plot.isUnlocked) {
            return;
        }
        if (plot.isEmpty()) {
            return;
        }
        if (this.shovelAmt() <= 0) {
            return;
        }
        plot.die(true);
        GameHelper.incrementObservable(this.shovelAmt, -1);
        GameHelper.incrementObservable(App.game.statistics.totalShovelsUsed, 1);

        this.resetAuras();
    }

    /**
     * Adds mulch to a plot
     * @param index The plot index
     * @param mulch The MulchType to be added
     * @param amount The amount of mulch to apply. Defaults to 1
     */
    public addMulch(index: number, mulch: MulchType, amount = 1) {
        const plot = this.plotList[index];
        if (!this.canMulch(index, mulch)) {
            return;
        }

        amount = Math.min(this.mulchList[mulch](), amount);

        GameHelper.incrementObservable(this.mulchList[mulch], -amount);
        GameHelper.incrementObservable(App.game.statistics.totalMulchesUsed, amount);
        GameHelper.incrementObservable(App.game.statistics.mulchesUsed[mulch], amount);

        plot.mulch = +mulch;
        plot.mulchTimeLeft += GameConstants.MULCH_USE_TIME * amount;
    }

    /**
     * Attempts to add mulch to all plots
     * @param mulch The MulchType to be added
     * @param amount The amount of mulch to apply to each plot. Defaults to 1
     */
    public mulchAll(mulch: MulchType, amount = 1) {
        const mulchPlots = this.plotList.filter((_, index) => this.canMulch(index, mulch));
        amount *= mulchPlots.length;
        amount = Math.min(this.mulchList[mulch](), amount);

        const sharedMulch = Math.floor(amount / mulchPlots.length);
        if (sharedMulch <= 0) {
            return;
        }

        this.plotList.forEach((_, index) => {
            this.addMulch(index, mulch, sharedMulch);
        });
    }

    private canMulch(index: number, mulch: MulchType) {
        const plot = this.plotList[index];
        if (!plot.isUnlocked || !this.hasMulch(mulch)) {
            return false;
        }
        if (plot.mulch != MulchType.None && plot.mulch != mulch) {
            return false;
        }
        return true;
    }

    /**
     * Gives the player a random Berry from the first 8 types
     * @param amount Amount of berries to give. Defaults to 1.
     * @param disableNotification Set to true to not notify the player. Defaults to false.
     */
    gainRandomBerry(amount = 1, disableNotification = false) {
        const berry = GameHelper.getIndexFromDistribution(GameConstants.BerryDistribution);
        if (!disableNotification) {
            Notifier.notify({
                message: `You got a ${BerryType[berry]} berry!`,
                type: NotificationConstants.NotificationOption.success,
                setting: NotificationConstants.NotificationSetting.route_item_found,
            });
        }
        this.gainBerry(berry, amount);
    }

    gainBerry(berry: BerryType, amount = 1) {
        GameHelper.incrementObservable(this.berryList[berry], Math.floor(amount));

        if (amount > 0) {
            this.unlockBerry(berry);
            GameHelper.incrementObservable(App.game.statistics.totalBerriesHarvested, amount);
            GameHelper.incrementObservable(App.game.statistics.berriesHarvested[berry], amount);
        }
    }

    hasBerry(berry: BerryType) {
        return this.berryList[berry]() > 0;
    }

    hasMulch(mulch: MulchType) {
        return this.mulchList[mulch]() > 0;
    }

    canAccess(): boolean {
        return MapHelper.accessToRoute(14, 0) && App.game.keyItems.hasKeyItem(KeyItems.KeyItem.Wailmer_pail);
    }

    unlockBerry(berry: BerryType) {
        if (!this.unlockedBerries[berry]()) {
            Notifier.notify({
                message: `You've discovered a ${BerryType[berry]} Berry!`,
                type: NotificationConstants.NotificationOption.success,
                setting: NotificationConstants.NotificationSetting.route_item_found,
            });
            this.unlockedBerries[berry](true);
        }
    }

    /**
     * Checks whether a Berry plant exists on the farm
     * @param berry The Berry type
     * @param stage The stage of the Berry plant. Defaults to PlotStage.Berry
     */
    berryInFarm(berry: BerryType, stage = PlotStage.Berry) {
        return this.plotList.some(plot => plot.berry == berry && plot.stage() >= stage);
    }

    toJSON(): Record<string, any> {
        return {
            berryList: this.berryList.map(ko.unwrap),
            unlockedBerries: this.unlockedBerries.map(ko.unwrap),
            mulchList: this.mulchList.map(ko.unwrap),
            plotList: this.plotList.map(plot => plot.toJSON()),
            shovelAmt: this.shovelAmt(),
            mutations: this.mutations.map(mutation => mutation.toJSON()),
        };
    }

    fromJSON(json: Record<string, any>): void {
        if (json == null) {
            return;
        }

        const savedBerries = json['berryList'];
        if (savedBerries == null) {
            this.berryList = this.defaults.berryList.map((v) => ko.observable<number>(v));
        } else {
            (savedBerries as number[]).forEach((value: number, index: number) => {
                this.berryList[index](value);
            });
        }

        const savedUnlockedBerries = json['unlockedBerries'];
        if (savedUnlockedBerries == null) {
            this.unlockedBerries = this.defaults.unlockedBerries.map((v) => ko.observable<boolean>(v));
        } else {
            (savedUnlockedBerries as boolean[]).forEach((value: boolean, index: number) => {
                this.unlockedBerries[index](value);
            });
        }

        const savedMulches = json['mulchList'];
        if (savedMulches == null) {
            this.mulchList = this.defaults.mulchList.map((v) => ko.observable<number>(v));
        } else {
            (savedMulches as number[]).forEach((value: number, index: number) => {
                this.mulchList[index](value);
            });
        }

        const savedPlots = json['plotList'];
        if (savedPlots == null) {
            this.plotList = this.defaults.plotList;
        } else {
            (savedPlots as Record<string, any>[]).forEach((value: Record<string, any>, index: number) => {
                const plot: Plot = new Plot(false, BerryType.None, 0, MulchType.None, 0);
                plot.fromJSON(value);
                this.plotList[index] = plot;
            });
        }

        const shovelAmt = json['shovelAmt'];
        if (shovelAmt == null) {
            this.shovelAmt = ko.observable(this.defaults.shovelAmt);
        } else {
            this.shovelAmt(shovelAmt);
        }

        const mutations = json['mutations'];
        if (mutations == null) {
            this.mutations.forEach(mutation => mutation.fromJSON({}));
        } else {
            this.mutations.forEach((mutation, i) => mutation.fromJSON(mutations[i]));
        }
    }

    public static genBounds = [8, 20, 35, 53, Infinity];
    public static getGeneration(gen: number): BerryType[] {
        const genBounds = Farming.genBounds;
        const minBound = genBounds[gen - 1] || 0;
        const maxBound = genBounds[gen] || Infinity;
        return App.game.farming.berryData.filter(berry => berry.type >= minBound && berry.type < maxBound).map(berry => berry.type);
    }

    public static getColor(color: BerryColor): BerryType[] {
        return App.game.farming.berryData.filter(berry => berry.color === color).map(berry => berry.type);
    }
}
