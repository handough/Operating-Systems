(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
            this.globalLimit = 256;
            this.partitions = [
                { "base": 0, "limit": this.globalLimit, "isEmpty": true },
                { "base": 256, "limit": this.globalLimit, "isEmpty": true }
            ];
        }
        // loading program into 00 position in memory 
        MemoryManager.prototype.loadMemory = function (opCode, partition) {
            var load = this.partitions[partition].base;
            for (var i = 0, firstOp = opCode; i < firstOp.length; i++) {
                var opCodes = firstOp[i];
                _Memory.memoryArray[load] = opCodes;
                load++;
            }
        };
        // checking for available memory space
        MemoryManager.prototype.checkMemory = function (codeLength) {
            // search through the partition 
            for (var i = 0; i < this.partitions.length; i++) {
                // if the partition is empty and hasnt hit the space limit return true 
                if (this.partitions[i].isEmpty && this.partitions[i].limit > codeLength) {
                    return true;
                }
            }
        };
        MemoryManager.prototype.freePartition = function (codeLength) {
            // search through the partition
            for (var i = 0; i < this.partitions.length; i++) {
                // if the partion is empty and hasnt hit the space limit return the empty space
                if (this.partitions[i].isEmpty && this.partitions[i].limit > codeLength) {
                    return i;
                }
            }
        };
    }());
    TSOS.MemoryManager = MemoryManager;
});
