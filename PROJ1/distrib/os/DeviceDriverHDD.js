var TSOS;
(function (TSOS) {
    var deviceDriverHDD = /** @class */ (function () {
        function deviceDriverHDD(formatted) {
            if (formatted === void 0) { formatted = false; }
            this.formatted = formatted;
            if (formatted == void 0) {
                formatted = false;
            }
            this.formatted = formatted;
        }
        deviceDriverHDD.prototype.krnHDDDriverEntry = function () {
            //this.status = "loaded";
        };
        deviceDriverHDD.prototype.krnHDDFormat = function () {
            var firstTSB = "1---MBR";
            var track = 0;
            var sector = 0;
            var block = 0;
            var TSB = track.toString() + sector.toString() + block.toString();
            var emptyData = '';
            // creating a empty TSB
            for (var i = 0; i < 64; i++) {
                if (i >= 1 && i <= 3) {
                    emptyData += '-';
                }
                else {
                    emptyData += '0';
                }
            }
            // after it has been formatted once
            if (this.formatted == true) {
                _hardDrive.write("000", firstTSB);
                for (var i = 1; i < _hardDrive.TSBList.length; i++) {
                    _hardDrive.write(_hardDrive.TSBList[i], emptyData);
                }
                for (var i = 0; i < _cpuScheduler.residentList.length; i++) {
                    if (_cpuScheduler.residentList[i].inHDD) {
                        _cpuScheduler.residentList[i].state = "TERMINATED";
                    }
                }
            }
            else {
                // inputing empty data
                for (var i = 0; i <= 999; i++) {
                    // preventing extra TSB
                    if (track == 3 && sector == 7 && block == 8) {
                        break;
                    }
                    // if TSB is first, it must be formatted 
                    if (track == 0 && sector == 0 && block == 0) {
                        _hardDrive.write(TSB, firstTSB);
                        _hardDrive.TSBList.push(TSB);
                        block++;
                    }
                    else {
                        // change the block sector and track numbers
                        if (block == 8) {
                            block = 0;
                            sector++;
                        }
                        if (sector == 8) {
                            sector = 0;
                            block = 0;
                            track++;
                        }
                        TSB = track.toString() + sector.toString() + block.toString();
                        _hardDrive.TSBList.push(TSB);
                        _hardDrive.write(TSB, emptyData);
                        block++;
                    }
                    TSOS.Control.createHDDTable();
                    this.formatted = true;
                }
            }
        };
        deviceDriverHDD.prototype.krnHDDCreateFile = function (fileName) {
            // change file name letters to hex
            var newFileName = fileName.split();
            var hexFileName = [];
            for (var i = 0; i < newFileName.length; i++) {
                hexFileName.push(newFileName[i].charCodeAt(0).toString(16));
            }
            // find first empty file
            for (var j = 0; j < 999; j++) {
                var TSB = _hardDrive.TSBList[j];
                var validInvalid = _hardDrive.read(TSB).split(" ")[0];
                // check if all files are full
                if (TSB = "100") {
                    return -1;
                }
                if (validInvalid == '1' && i > 0) {
                    // read file data and use slice to only look for file name
                    var data = _hardDrive.read(TSB).split(" ").slice(4);
                    var compare = '';
                    // create data to compare to 
                    for (var i = 0; i < hexFileName.length; i++) {
                        compare += hexFileName[i];
                    }
                    for (var x = compare.length - 1; x < 59; x++) {
                        compare += '0';
                    }
                    // if they are the same then the file already exists
                    if (data.join(" ") == compare) {
                        return 0;
                    }
                }
                else if (validInvalid == '0' && i > 0) {
                    // get empty data block and change the bit to 1
                    var emptyDataTSB = this.krnHDDFindEmptyDataBlock();
                    var emptyData = _hardDrive.read(emptyDataTSB);
                    var emptyDataArray = emptyData.split(" ");
                    emptyDataArray[0] = '1';
                    emptyData = emptyDataArray.join("");
                    _hardDrive.write(emptyDataTSB, emptyData);
                    var dataa = '1';
                    for (var i = 0; i < hexFileName.length; i++) {
                        dataa += hexFileName[i];
                    }
                    //put all 0s to the end of the file name
                    for (var i = dataa.length - 1; i < 63; i++) {
                        dataa += '0';
                    }
                    // write to HDD and update HDD
                    _hardDrive.write(TSB, dataa);
                    this.updateHDDTable();
                    return 1;
                }
            }
        };
        deviceDriverHDD.prototype.krnHDDWriteFile = function (filename, data) {
        };
        deviceDriverHDD.prototype.krnHDDCheckFileExists = function () {
        };
        deviceDriverHDD.prototype.krnHDDReadFile = function () {
        };
        deviceDriverHDD.prototype.krnHDDClearTSB = function () {
        };
        deviceDriverHDD.prototype.krnHDDFindFileBlock = function () {
        };
        deviceDriverHDD.prototype.krnHDDFindEmptyDataBlock = function () {
        };
        deviceDriverHDD.prototype.krnHDDDeleteFile = function () {
        };
        deviceDriverHDD.prototype.krnHDDListFiles = function () {
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
    }());
    TSOS.deviceDriverHDD = deviceDriverHDD;
})(TSOS || (TSOS = {}));
