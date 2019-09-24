function PCB(processId) {
    this.processId = processId;
    this.pid = processId;
    function processControlBlock(segment) {
        this.PC = 0;
        this.Acc = 0;
        this.IR = "00";
        this.Xreg = 0;
        this.Yreg = 0;
        this.Zreg = 0;
        this.segment = segment;
    }
}
