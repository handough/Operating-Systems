var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TSOS;
(function (TSOS) {
    var MemoryAccessor = /** @class */ (function (_super) {
        __extends(MemoryAccessor, _super);
        function MemoryAccessor() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MemoryAccessor.prototype.write = function (memSlot, op) {
            var opArray = new Array(op.toString().split(" "));
            var opCount = 0;
            if (memSlot == 0) { // if the ops are being written to the first part of memory 
                var pos = 0;
                for (var i = 0; i < 255; i++) {
                    if (i == opArray[0].length) {
                        this.memory[i] = -1;
                        break;
                    }
                    this.memory[i] = opArray[0][pos];
                    opCount++;
                    pos++;
                }
            }
            else if (memSlot == 1) { // if the ops are being written to the second part of memory 
                var pos = 0;
                for (var i = 256; i < 511; i++) {
                    if (opCount == opArray[0].length) {
                        this.memory[i] = -1;
                        break;
                    }
                    this.memory[i] = opArray[0][pos];
                    opCount++;
                    pos++;
                }
            }
            else if (memSlot == 2) { // if the ops are being written to the third part of memory 
                var pos = 0;
                for (var i = 512; i < 767; i++) {
                    if (opCount == opArray[0].length) {
                        this.memory[i] = -1;
                        break;
                    }
                    this.memory[i] = opArray[0][pos];
                    opCount++;
                    pos++;
                }
            }
        };
        MemoryAccessor.prototype.read = function (memSlot) {
            var opArray = [];
            if (memSlot == 0) {
                for (var i = 0; i < 256; i++) {
                    if (this.memory[i] != -1) {
                        opArray.push(this.memory[i]);
                    }
                    else {
                        this.memory[i] = 0;
                        break;
                    }
                }
            }
            else if (memSlot == 1) {
                for (var i = 256; i < 512; i++) {
                    if (this.memory[i] != -1) {
                        opArray.push(this.memory[i]);
                    }
                    else {
                        this.memory[i] = 0;
                        break;
                    }
                }
            }
            else if (memSlot == 2) {
                for (var i = 512; i < 768; i++) {
                    if (this.memory[i] != -1) {
                        opArray.push(this.memory[i]);
                    }
                    else {
                        this.memory[i] = 0;
                        break;
                    }
                }
            }
            return opArray;
        };
        return MemoryAccessor;
    }(TSOS.Memory));
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
