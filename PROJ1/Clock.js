var TSOS;
(function (TSOS) {
    var Clock = /** @class */ (function () {
        function Clock(h, m) {
            this.currentTime = new Date();
        }
        Clock.prototype.setTime = function (d) {
            this.currentTime = d;
        };
        return Clock;
    }());
    TSOS.Clock = Clock;
})(TSOS || (TSOS = {}));
