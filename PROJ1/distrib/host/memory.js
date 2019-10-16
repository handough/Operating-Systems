var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(memory) {
            if (memory === void 0) { memory = []; }
            this.memory = memory;
            if (memory == void 0) {
                memory = [];
            }
        }
        //
        Memory.prototype.init = function () {
            for (var i = 0; i < 768; i++) {
                this.memory.push(0);
            }
        };
        // resets memory to all zeros
        Memory.prototype.eraseAll = function () {
            this.init();
        };
        Memory.prototype.eraseBlock = function (memSlot) {
            if (memSlot == 0) {
                for (var i = 0; i < 256; i++) {
                    this.memory[i] = 0;
                }
            }
            else if (memSlot == 1) {
                for (var i = 256; i < 512; i++) {
                    this.memory[i] = 0;
                }
            }
            else if (memSlot == 2) {
                for (var i = 512; i < 768; i++) {
                    this.memory[i] = 0;
                }
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
