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
    var deviceDriverHDD = /** @class */ (function (_super) {
        __extends(deviceDriverHDD, _super);
        function deviceDriverHDD(formatted) {
            if (formatted === void 0) { formatted = false; }
            var _this = _super.call(this) || this;
            _this.formatted = formatted;
            _this.driverEntry = _this.krnHDDDriverEntry;
            return _this;
        }
        deviceDriverHDD.prototype.krnHDDDriverEntry = function () {
            this.status = "loaded";
        };
        deviceDriverHDD.prototype.krnHDDFormat = function () {
            var first = "1---MBR";
            var emptyData = '';
            if (this.formatted == true) {
                _hardDrive.write("000", '000');
                for (var i = 1; i < _hardDrive.TSBList.length; i++) {
                    _hardDrive.write(_hardDrive.TSBList[i], emptyData);
                }
                for (var i = 0; i < _cpuScheduler.residentList.length; i++) {
                    if (_cpuScheduler.residentList[i].inHDD) {
                        _cpuScheduler.residentList[i].state = "TERMINATED";
                    }
                }
            }
            TSOS.Control.createHDDTable();
            this.formatted = true;
        };
        deviceDriverHDD.prototype.krnHDDCreateFile = function (file) {
            // Change file name to hex
            var newFile = file.split("");
            var hexFile = [];
            for (var i = 0; i < newFile.length; i++) {
                hexFile.push(newFile[i].charCodeAt(0).toString(16));
            }
            // Find first empty file
            for (var i = 0; i < 999; i++) {
                var TSB = _hardDrive.TSBList[i]; // 000 or 001
                TSB.toString();
                // get empty data block and change the bit to 1
                var emptyTSB = this.krnHDDFindEmptyDataBlock();
                var emptyData = _hardDrive.read(emptyTSB);
                var emptyDataArray = emptyData.split(" ");
                emptyDataArray[0] = '1';
                emptyData = emptyDataArray.join("");
                _hardDrive.write(emptyTSB, emptyData);
                var newData = '1' + emptyTSB;
                for (var i = 0; i < hexFile.length; i++) {
                    newData += hexFile[i];
                }
                // put 0s to end of file name 
                for (var i = newData.length - 1; i < 63; i++) {
                    newData += '0';
                }
                // write to HDD and update HDD
                _hardDrive.write(TSB, newData);
                this.updateHDDTable();
                return 1;
            }
            return 1;
        };
        deviceDriverHDD.prototype.krnHDDWriteFile = function (filename, data) {
            // Convert to hex
            var newData = data.split("");
            var hexData = [];
            for (var i = 0; i < newData.length; i++) {
                hexData.push(newData[i].charCodeAt(0).toString(16));
            }
            // Changing hex data to a string 
            var hexDataString = hexData.join("");
            hexData = hexDataString.split("");
            var hexDataCount = 0;
            // get current TSB from file 
            var TSB = this.krnHDDFindFileBlock();
            var TSBB = TSB.toString();
            var TS = '00' + TSBB;
            var currentTSBData = _hardDrive.read(TS);
            var currentArray = currentTSBData.split("")[0];
            var clearTSBList = [TSB];
            if (clearTSBList.length != 0) {
                for (var i = 0; i < clearTSBList.length; i++) {
                    this.krnHDDClearTSB(clearTSBList[i]);
                }
            }
            // actually writting to the file 
            for (var i = 0; i < 60; i++) {
                var x = 0;
                var inputData = '1';
                // set TSB bit to 1 so it is in use
                currentTSBData = _hardDrive.read(TSB);
                var currentArray = currentTSBData.split("");
                currentArray[0] = '1';
                _hardDrive.write(TSB, currentArray.join(""));
                inputData += this.krnHDDFindEmptyDataBlock();
                while (x < 60) {
                    if (hexDataCount >= hexData.length) {
                        inputData += '0';
                    }
                    else {
                        inputData += hexData[hexDataCount];
                        hexDataCount++;
                    }
                    x++;
                }
                _hardDrive.write(TSB, inputData);
                TSB = this.krnHDDFindEmptyDataBlock();
            }
            this.updateHDDTable(); // display block in use
        };
        deviceDriverHDD.prototype.krnHDDReadFile = function () {
            // current files TSB
            var fileTSB = this.krnHDDFindFileBlock();
            fileTSB.toString();
            var filer = '00' + fileTSB;
            var fileTSBArray = _hardDrive.read(filer).split(""); // fileTSB
            var dataTSBList = [];
            for (var i = 4; i < fileTSBArray.length; i++) {
                if (fileTSBArray[i] != 0) {
                    dataTSBList.push(fileTSBArray[i]);
                }
            }
            // convert hex to a normal string 
            var hexString = '';
            for (var i = 0; i < dataTSBList.length; i++) {
                for (var j = 0; j < dataTSBList[i].length; j++) {
                    hexString += dataTSBList[i][j];
                }
            }
            // Turn hex string into normal string
            var returnString = '';
            for (var i = 0; i < hexString.length; i += 2) {
                if (hexString.substring(i, i + 2) == '00') {
                    break;
                }
                var str = String.fromCharCode(parseInt(hexString.substring(i, i + 2), 16));
                returnString += str;
            }
            return returnString;
        };
        deviceDriverHDD.prototype.krnHDDClearTSB = function (TSB) {
            var emptyData = '';
            // write empty data
            for (var i = 0; i < 64; i++) {
                emptyData += '0';
            }
            // write the empty TSB
            _hardDrive.write(TSB, emptyData);
        };
        deviceDriverHDD.prototype.krnHDDFindFileBlock = function () {
            // find TSB
            for (var j = 0; j < _hardDrive.TSBList.length; j++) {
                var TSB = _hardDrive.TSBList[j];
                var data = _hardDrive.read(TSB).split("")[j];
                return data;
            }
        };
        deviceDriverHDD.prototype.krnHDDFindEmptyDataBlock = function () {
            // find first empty data block
            var first = 0;
            // find first block
            for (var i = first; i < _hardDrive.TSBList.length; i++) {
                if (_hardDrive.read(_hardDrive.TSBList[i]).split("")[0] == '0') {
                    return _hardDrive.TSBList[i];
                }
            }
        };
        deviceDriverHDD.prototype.krnHDDListFiles = function () {
            // get all files by looping through TSBList
            var files = [];
            for (var i = 1; i < _hardDrive.TSBList.length; i++) {
                files.push(_hardDrive.TSBList[i]); // array of all files
            }
            // check which ones are in use
            for (var i = 0; i < files.length; i++) {
                if (_hardDrive.read(files[i]).split("")[0] == '1') {
                    // convert to hex 
                    var hexString = _hardDrive.read(files[i]);
                    var newHex = '';
                    var filer = true;
                    while (filer == true) {
                        if (hexString[i + 1] != 0) {
                            newHex += hexString[i];
                            i++;
                            filer = true;
                        }
                        else {
                            filer = false;
                        }
                    }
                }
                var str = String.fromCharCode(parseInt(newHex.substring(i, i + 2), 16));
                var ret = [];
                ret[i] = str;
            }
            // if there are no created files 
            if (ret.length == 0) {
                _StdOut.putText("No files have been created!");
                _StdOut.advanceLine();
                _StdOut.putText("Use create command to make files.");
            }
            else { // print out files 
                for (var i = 0; i < ret.length; i++) {
                    _StdOut.putText(ret);
                    if (i != ret.length - 1) {
                        _StdOut.advanceLine();
                    }
                }
            }
        };
        deviceDriverHDD.prototype.updateHDDTable = function () {
            // update html table with new data 
            var table = document.getElementById("hardDriveTable");
            var x = 1;
            // loop through list of TSB
            for (var i = 0; i < _hardDrive.TSBList.length; i++) {
                var TSB = _hardDrive.TSBList[i];
                var mem = _hardDrive.read(TSB);
                var row = table.getElementsByTagName("tr")[x];
                row.cells[1].innerHTML = mem;
                x++;
            }
        };
        return deviceDriverHDD;
    }(TSOS.DeviceDriver));
    TSOS.deviceDriverHDD = deviceDriverHDD;
})(TSOS || (TSOS = {}));
