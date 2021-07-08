class MachineHandler {

    public static machineList: Machine[] = [];
    public static machineListFiltered: KnockoutObservableArray<Machine> = ko.observableArray([]);

    public static filterMachineList(retainPage = false) {
        this.machineListFiltered(this.machineList.filter((machine) => machine.amount));
    }


    public static handleClick(machine: Machine) {
        this.filterMachineList(true);

        // Set selected machine for Lab.
        LabController.selectedMachine(machine);

        // Update machine select grid
        LabController.setupGrid();

        // Close modal
        $('#machineListModal').modal('hide');
    }
}
