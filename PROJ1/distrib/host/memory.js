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
        Memory.prototype.init = function () {
            for (var i = 0; i < 256; i++) {
                this.memory.push(0);
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
