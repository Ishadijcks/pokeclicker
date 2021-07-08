/// <reference path="../party/PartyListController.ts" />
/// <reference path="./machines/PlacedMachine.ts" />

class LabController extends PartyListController {

    public static openLabModal() {
        if (App.game.lab.canAccess()) {
            $('#labModal').modal('show');
        } else {
            Notifier.notify({
                message: 'You need the Laboratory Key to access this location',
                type: NotificationConstants.NotificationOption.warning,
            });
        }
    }

    //#region Worker Assignment

    public static selectedResearchSlot: KnockoutObservable<number> = ko.observable(0);

    public static visible(partyPokemon: PartyPokemon) {
        return ko.pureComputed(() => {
            // Only working Pokemon
            if (partyPokemon.location !== PartyLocation.Battle) {
                return false;
            }

            const research = App.game.lab.currentResearch()[LabController.selectedResearchSlot()];
            if (research?.research?.workerFilter && !research?.research?.workerFilter?.filter(partyPokemon)) {
                return false;
            }

            return LabController.applyFilters(partyPokemon);
        });
    }

    private static canAddWorkers(researchSlotIndex: number) {
        const research = App.game.lab.currentResearch()[researchSlotIndex];
        if (!research) {
            return false;
        }
        return research.workers.length < research.maxWorkers;
    }

    public static disabled(partyPokemon: PartyPokemon) {
        return !this.canAddWorkers(LabController.selectedResearchSlot());
    }

    public static handleClick(partyPokemon: PartyPokemon) {
        if (!this.canAddWorkers(LabController.selectedResearchSlot())) {
            return;
        }
        const research = App.game.lab.currentResearch()[LabController.selectedResearchSlot()];
        research.addWorker(partyPokemon);

        // Check if close Modal
        if (research.workers.length === research.maxWorkers) {
            $('#researchWorkerModal').modal('hide');
        }
    }

    public static openPartyListModal(index: number) {
        LabController.selectedResearchSlot(index);
        $('#researchWorkerModal').modal('show');
    }

    //#endregion

    //#region Research

    public static openResearchListModal() {
        if (ResearchHandler.researchList.length === 0) {
            ResearchHandler.researchList = App.game.lab.researchList.map(research => research.id);
            ResearchHandler.resetPages();
            ResearchHandler.filterResearchList();
        }
        $('#researchListModal').modal('show');
    }

    //#endregion

    //#region Machines

    public static openedMachine: KnockoutObservable<PlacedMachine> = ko.observable(new PlacedMachine());

    public static selectedMachine: KnockoutObservable<Machine | undefined> = ko.observable(undefined);

    public static cursorOnGrid: KnockoutObservable<boolean> = ko.observable(false);
    public static cursorX: KnockoutObservable<number> = ko.observable(0);
    public static cursorY: KnockoutObservable<number> = ko.observable(0);

    public static hoverTopMargin: KnockoutComputed<string> = ko.pureComputed(() => {
        return `${LabController.cellHeight() * (LabController.cursorY() + 1)}%`;
    })
    public static hoverLeftMargin: KnockoutComputed<string> = ko.pureComputed(() => {
        return `${LabController.cellWidth() * (LabController.cursorX() + 1)}%`;
    })

    public static machineWidth: KnockoutComputed<string> = ko.pureComputed(() => {
        return `${LabController.cellWidth() * (LabController.selectedMachine() ? LabController.selectedMachine().width : 0)}%`;
    });
    public static machineHeight: KnockoutComputed<string> = ko.pureComputed(() => {
        return `${LabController.cellHeight() * (LabController.selectedMachine() ? LabController.selectedMachine().height : 0)}%`;
    });

    public static labColumns: KnockoutComputed<number> = ko.pureComputed(() => Lab.labSizes[App.game.lab.labLevel()].x);
    public static labRows: KnockoutComputed<number> = ko.pureComputed(() => Lab.labSizes[App.game.lab.labLevel()].y);

    public static cellWidth: KnockoutComputed<number> = ko.pureComputed(() => 100 / (LabController.labColumns() + 2));
    public static cellHeight: KnockoutComputed<number> = ko.pureComputed(() => 100 / (LabController.labRows() + 1));

    public static selectedMachineVisible: KnockoutComputed<boolean> = ko.pureComputed(() => {
        if (!LabController.cursorOnGrid()) {
            return false;
        }

        // Handle super-illegal positions
        const machine = LabController.selectedMachine();
        if (!machine) {
            return false;
        }
        if (LabController.cursorY() + machine.height > LabController.labRows()) {
            return false;
        }
        if (LabController.cursorX() + machine.width > LabController.labColumns()) {
            return false;
        }

        return true;
    });

    public static getLabImage(): string {
        return `assets/images/lab/Lab${App.game.lab.labLevel()}.png`;
    }

    public static setupGrid() {
        const grid = $('#labGrid');

        const top = LabController.cellHeight();
        grid.css('top', `${top}%`);
        const left = LabController.cellWidth();
        grid.css('left', `${left}%`);
        const width = 100 - (2 * left);
        grid.css('width', `${width}%`);
        const height = 100 - top;
        grid.css('height', `${height}%`);
    }

    public static updateHover(x: number, y:number) {
        // Show machine hover
        LabController.cursorOnGrid(true);

        // Update cursor positions
        LabController.cursorX(x);
        LabController.cursorY(y);
    }

    public static clearHover() {
        // Hide machine hover
        LabController.cursorOnGrid(false);
    }

    public static getBlockedCells(): number[][] {
        const cells = [];

        // Remove blocked cells
        App.game.lab.placedMachines().forEach(placedMachine => {
            placedMachine.cells().forEach(cell => cells.push(cell));
        });

        return cells;
    }

    public static placeMachine(x: number, y: number) {
        // Sanity checks
        const machine = LabController.selectedMachine();
        if (!machine) {
            return;
        }
        if (!machine.amount) {
            return;
        }
        if (y + machine.height > LabController.labRows()) {
            return;
        }
        if (x + machine.width > LabController.labColumns()) {
            return;
        }

        // Check placement
        const cells = machine.cells(x, y);
        const blockedCells = LabController.getBlockedCells();
        const blocked = cells.some(cell => {
            return blockedCells.findIndex(blockedCell => GameHelper.arrayEquals(blockedCell,cell)) != -1;
        });
        if (blocked) {
            return;
        }

        // Adding machine
        App.game.lab.placedMachines.push(new PlacedMachine(machine, x, y));
        machine.amount -= 1;

        // Canceling add if no machines left
        if (machine.amount == 0) {
            LabController.selectedMachine(undefined);
        }
    }

    public static additionalInfoTooltip: KnockoutComputed<string> = ko.pureComputed(() => {
        const tooltip = [];
        App.game.lab.resetEffects();

        // Multipliers
        for (const [key, value] of Object.entries(App.game.lab.machineEffects)) {
            if (typeof value === 'undefined') {
                continue;
            }

            if (key == 'Egg Queue Slots') {
                if (value() >= 1) {
                    tooltip.push(`${key}: ${value().toFixed(0)}`);
                }
            } else if (value() !== 1) {
                tooltip.push(`${key}: ${value().toFixed(2)}x`);
            }
        }

        // Adding header if necessary
        if (tooltip.length) {
            tooltip.unshift('<u>Effects:</u>');
        }

        return tooltip.join('<br>');
    });

    public static handleMachineClick(placedMachine: PlacedMachine) {
        if (placedMachine.machine.hasModal()) {
            LabController.openedMachine(placedMachine);
            placedMachine.machine.openModal();
        }
    }

    public static openMachineListModal() {
        if (MachineHandler.machineList.length === 0) {
            MachineHandler.machineList = App.game.lab.machines;
        }
        MachineHandler.filterMachineList();
        $('#machineListModal').modal('show');
    }

    //#endregion

}

