module TSOS{
    export class deviceDriverHDD extends DeviceDriver{
        constructor(public formatted: boolean = false){
            super();
            this.driverEntry = this.krnHDDDriverEntry;
        }

        public krnHDDDriverEntry(){
            this.status = "loaded";
        }

        public krnHDDFormat(){
                // format the first TSB
                var firstTSB = "1---MBR";
                var tracker = 0;
                var pos = 0;
                var block = 0;
                var TSB = tracker.toString() + pos.toString() + block.toString();
                // empty data for the TSB
                var emptyData = '';
                // creating the empty TSB
                for (var i = 0; i < 64; i++) {
                    if (i >= 1 && i <= 3) {
                        emptyData += '-';
                    }
                    else {
                        emptyData += '0';
                    }
                }
                // if it has already been formatted 
                if (this.formatted == true) {
                    _hardDrive.write("000", firstTSB);
                    for (var i = 1; i < _hardDrive.TSBList.length; i++) {
                        _hardDrive.write(_hardDrive.TSBList[i], emptyData);
                    }
                    for (var i = 0; i < _cpuScheduler.residentList.length; i++) {
                        if (_cpuScheduler.residentList[i].inHDD) {
                            _cpuScheduler.residentList[i].State = "TERMINATED";
                        }
                    }
                }
                else {
                    // input the starting empty data 
                    for (var i = 0; i <= 999; i++) {
                        if (tracker == 3 && pos == 7 && block == 8) {
                            break;
                        }
                        // if the TSB make sure it is formatted 
                        if (tracker == 0 && pos == 0 && block == 0) {
                            _hardDrive.write(TSB, firstTSB);
                            _hardDrive.TSBList.push(TSB);
                            block++;
                        }
                        else {
                            if (block == 8) {
                                block = 0;
                                pos++;
                            }
                            if (pos == 8) {
                                block = 0;
                                pos = 0;
                                tracker++;
                            }
                            TSB = tracker.toString() + pos.toString() + block.toString();
                            _hardDrive.TSBList.push(TSB);
                            _hardDrive.write(TSB, emptyData);
                            block++;
                        }
                    }
                    TSOS.Control.createHDDTable();
                    this.formatted = true;
                }
                this.updateHDDTable();
        }

        public krnHDDCreateFile(fileName){
            // convert file name to hex 
            var newer = fileName.split("");
            var hexList = [];
            for (var i = 0; i < newer.length; i++) {
                hexList.push(newer[i].charCodeAt(0).toString(16));
            }
            // find first empty file 
            for (var j = 0; j < 999; j++) {
                var TSB = _hardDrive.TSBList[j];
                var validInvalid = _hardDrive.read(TSB).split("")[0];
                // hdd full if TSB hits 100
                if (TSB == "100") {
                    return -1;
                }
                // checking if file exists
                if (validInvalid == '1' && i > 0) {
                    var data = _hardDrive.read(TSB).split("").slice(4);
                    var compared = '';
                    // comparasion data
                    for (var i = 0; i < hexList.length; i++) {
                        compared += hexList[i];
                    }
                    for (var x = compared.length - 1; x < 59; x++) {
                        compared += '0';
                    }
                    // if they are not = the file has been created 
                    if (data.join("") == compared) {
                        return 0;
                    }
                }
                else if (validInvalid == '0' && i > 0) {
                    // get empty data 
                    var emptyDataTSB = this.krnHDDFindEmptyDataBlock();
                    var emptyData = _hardDrive.read(emptyDataTSB);
                    var emptyDataArray = emptyData.split("");
                    emptyDataArray[0] = '1';
                    emptyData = emptyDataArray.join("");
                    _hardDrive.write(emptyDataTSB, emptyData);
                    var data2 = '1' + emptyDataTSB;
                    for (var i = 0; i < hexList.length; i++) {
                        data2 += hexList[i];
                    }
                    // put 0s at end of file
                    for (var i = data2.length - 1; i < 63; i++) {
                        data2 += '0';
                    }
                    // write to HDD
                    _hardDrive.write(TSB, data2);
                    this.updateHDDTable();
                    return 1;
                }
            }
        }

        public krnHDDWriteFile(filename, data){
            // convert data to hex 
            var up = data.split("");
            var hexData = [];
            for (var i = 0; i < up.length; i++) {
                hexData.push(up[i].charCodeAt(0).toString(16));
            }
            // convert to a string
            var hexDataStringer = hexData.join("");
            var links = 1;
            // check if less than 60  bytes
            if (hexDataStringer.length > 60) {
                links = Math.ceil(hexDataStringer.length / 60);
            }
            // split string into an array 
            hexData = hexDataStringer.split("");
            var hexDataCount = 0;
            // get TSB from file data 
            var TSB = this.krnHDDFindFileBlock(filename);
            var currentTSB = _hardDrive.read(TSB);
            var currentTSBArray = currentTSB.split("");
            TSB = '';
            TSB += currentTSBArray[1];
            TSB += currentTSBArray[2];
            TSB += currentTSBArray[3];
            // clear tsb
            var temporaryTSB = TSB; 
            var clearTSBList = [temporaryTSB];
            while (true) {
                var TSBData = _hardDrive.read(temporaryTSB);
                if (TSBData.split("")[1] != '-') {
                    temporaryTSB = '';
                    temporaryTSB += TSBData.split("")[1];
                    temporaryTSB += TSBData.split("")[2];
                    temporaryTSB += TSBData.split("")[3];
                    clearTSBList.push(temporaryTSB);
                }
                else {
                    break;
                }
            }
            if (clearTSBList.length != 0) {
                for (var i = 0; i < clearTSBList.length; i++) {
                    this.krnHDDClearTSB(clearTSBList[i]);
                }
            }
            // actually writing to the file
            for (var i = 0; i < links; i++) {
                var x = 0;
                var input = '1';
                currentTSB = _hardDrive.read(TSB);
                var currentTSBDataArray = currentTSB.split("");
                currentTSBDataArray[0] = '1';
                _hardDrive.write(TSB, currentTSBDataArray.join(""));
                // if there is no link 
                if (i === links - 1) {
                    input += '---';
                }
                else {
                    input += this.krnHDDFindEmptyDataBlock();
                }
                while (x < 60) {
                    if (hexDataCount >= hexData.length) {
                        input += '0';
                    }
                    else {
                        input += hexData[hexDataCount];
                        hexDataCount++;
                    }
                    x++;
                }
                _hardDrive.write(TSB, input);
                TSB = this.krnHDDFindEmptyDataBlock();
            }
            this.updateHDDTable();
        }

        public krnHDDCheckFileExists(fileName){
            // change file name to hex
            var newer = fileName.split("");
            var hexList = [];
            for (var i = 0; i < newer.length; i++) {
                hexList.push(newer[i].charCodeAt(0).toString(16));
            }
            // search all TSBs
            for (var j = 0; j < _hardDrive.TSBList.length; j++) {
                var TSB = _hardDrive.TSBList[j];
                // the file already exists 
                if (TSB === "100") {
                    return false;
                }
                var data = _hardDrive.read(TSB).split("").slice(4);
                var comparedData = '';
                // comparasion data
                for (var x = 0; x < hexList.length; x++) {
                    comparedData += hexList[x];
                }
                for (var y = comparedData.length - 1; y < 59; y++) {
                    comparedData += '0';
                }
                // if the data is the same as the compared data it already exists 
                if (data.join("") == comparedData) {
                    return true;
                }
            }
        }

        public krnHDDReadFile(fileName){
            // the current TSB
            var fileTSB = this.krnHDDFindFileBlock(fileName);
            var fileTSBArray = _hardDrive.read(fileTSB).split("");
            // make data block
            var dataTSB = '';
            dataTSB += fileTSBArray[1];
            dataTSB += fileTSBArray[2];
            dataTSB += fileTSBArray[3];
            var dataTSBList = [dataTSB];
            while (true) {
                var TSBData = _hardDrive.read(dataTSB);
                if (TSBData.split("")[1] != '-') {
                    dataTSB = '';
                    dataTSB += TSBData.split("")[1];
                    dataTSB += TSBData.split("")[2];
                    dataTSB += TSBData.split("")[3];
                    dataTSBList.push(dataTSB);
                }
                else {
                    break;
                }
            }
            // fetching hex version of data 
            var hexDataLister = [];
            for (var i = 0; i < dataTSBList.length; i++) {
                hexDataLister.push(_hardDrive.read(dataTSBList[i]).split("").slice(4));
            }
            // input conversion to normal string 
            var hexString = '';
            for (var i = 0; i < hexDataLister.length; i++) {
                for (var j = 0; j < hexDataLister[i].length; j++) {
                    hexString += hexDataLister[i][j];
                }
            }
            // convert hex into string to return 
            var returnString = '';
            for (var i = 0; i < hexString.length; i += 2) {
                if (hexString.substring(i, i + 2) == '00') {
                    break;
                }
                var str = String.fromCharCode(parseInt(hexString.substring(i, i + 2), 16));
                returnString += str;
            }
            return returnString;
        }

        public krnHDDClearTSB(TSB){
            var emptyData = '';
            // clearing the data 
            for (var i = 0; i < 64; i++) {
                if (i >= 1 && i <= 3) {
                    emptyData += '-';
                }
                else {
                    emptyData += '0';
                }
            }
            // inputing the empty data into the TSB block 
            _hardDrive.write(TSB, emptyData);
        }

        public krnHDDFindFileBlock(fileName){
            // convert file name to hex 
            var newFileName = fileName.split("");
            var hexFileNameList = [];
            for (var i = 0; i < newFileName.length; i++) {
                hexFileNameList.push(newFileName[i].charCodeAt(0).toString(16));
            }
            // search all TSBs 
            for (var j = 0; j < _hardDrive.TSBList.length; j++) {
                var TSB = _hardDrive.TSBList[j];
                var data = _hardDrive.read(TSB).split("").slice(4);
                console.log(data);
                var compareData = '';
                // comparing the data to file data 
                for (var x = 0; x < hexFileNameList.length; x++) {
                    compareData += hexFileNameList[x];
                }
                for (var y = compareData.length - 1; y < 59; y++) {
                    compareData += '0';
                }
                // if they are the same it exists 
                if (data.join("") == compareData) {
                    console.log(TSB);
                    return TSB;
                }
            }
        }

        public krnHDDFindEmptyDataBlock(){
            // starting point
            var starting = 0;
            // where the TSB starts
            for (var i = 0; i < _hardDrive.TSBList.length; i++) {
                if (_hardDrive.TSBList[i] == '100') {
                    starting = i;
                    break;
                }
            }
            for (var i = starting; i < _hardDrive.TSBList.length; i++) {
                // return the first empty block 
                if (_hardDrive.read(_hardDrive.TSBList[i]).split("")[0] == '0') {
                    return _hardDrive.TSBList[i];
                }
            }
        }

        public krnHDDDeleteFile(fileName){
            // get the files TSB
            var currentFileTSB = this.krnHDDFindFileBlock(fileName);
            var fileTSBArray = _hardDrive.read(currentFileTSB).split("");
            // TSB data block
            var dataTSB = '';
            dataTSB += fileTSBArray[1];
            dataTSB += fileTSBArray[2];
            dataTSB += fileTSBArray[3];
            // deleting data
            var dataTSBList = [currentFileTSB, dataTSB];
            while (true) {
                var TSBData = _hardDrive.read(dataTSB);
                if (TSBData.split("")[1] != '-') {
                    dataTSB = '';
                    dataTSB += TSBData.split("")[1];
                    dataTSB += TSBData.split("")[2];
                    dataTSB += TSBData.split("")[3];
                    dataTSBList.push(dataTSB);
                }
                else {
                    break;
                }
            }
            // clear TSB function 
            for (var i = 0; i < dataTSBList.length; i++) {
                this.krnHDDClearTSB(dataTSBList[i]);
            }
            this.updateHDDTable();
        }

        public krnHDDListFiles(){
            // list all TSB up to 100 
            var fileTSB = [];
            for (var i = 1; i < _hardDrive.TSBList.length; i++) {
                if (_hardDrive.TSBList[i] == '100') {
                    break;
                }
                fileTSB.push(_hardDrive.TSBList[i]);
            }
            // check which ones are in use 
            var fileNames = [];
            for (var i = 0; i < fileTSB.length; i++) {
                if (_hardDrive.read(fileTSB[i]).split("")[0] == '1') {
                    // convert to hex 
                    var normalString = '';
                    var hexString = _hardDrive.read(fileTSB[i]).split("").slice(4).join("");
                    for (var j = 0; j < hexString.length; j += 2) {
                        normalString += String.fromCharCode(parseInt(hexString.substring(j, j + 2), 16));
                    }
                    console.log(normalString);
                    fileNames.push(normalString);
                }
            }
            // if there are no files
            if (fileNames.length == 0) {
                _StdOut.putText("No files");
            }
            else { // print out file names
                for (var i = 0; i < fileNames.length; i++) {
                    _StdOut.putText(fileNames[i]);
                    if (i != fileNames.length - 1) {
                        _StdOut.advanceLine();
                    }
                }
            }
        }

        public updateHDDTable(){
            // update html table with new data 
            var table = document.getElementById("hardDriveTable");
            var x = 1;
            // loop through list of TSB
            for(var i = 0; i < _hardDrive.TSBList.length; i++){
                var TSB = _hardDrive.TSBList[i];
                var mem = _hardDrive.read(TSB);
                var row = table.getElementsByTagName("tr")[x];
                row.cells[1].innerHTML = mem;
                x++;
            }
        }
    }
}