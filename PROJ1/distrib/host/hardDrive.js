var TSOS;
(function (TSOS) {
    var hardDrive = /** @class */ (function () {
        function hardDrive(TSBList) {
            if (TSBList === void 0) { TSBList = []; }
            this.TSBList = TSBList;
        }
        hardDrive.prototype.write = function (tsb, data) {
            sessionStorage[tsb] = data;
        };
        hardDrive.prototype.read = function (tsb) {
            return sessionStorage[tsb];
        };
        return hardDrive;
    }());
    TSOS.hardDrive = hardDrive;
})(TSOS || (TSOS = {}));
