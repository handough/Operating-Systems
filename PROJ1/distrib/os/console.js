/* ------------
     Console.ts
     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = /** @class */ (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr == String.fromCharCode(8)) { // backspace
                    this.backSpace();
                }
                else if (chr == String.fromCharCode(9)) { // the tab key
                    this.commandRecall(chr);
                }
                else if (chr === String.fromCharCode(38)) {
                    this.commandRecall(chr);
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        };
        Console.prototype.putText = function (text) {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            if (this.currentYPosition > _Canvas.height) {
                var move = this.currentYPosition - _Canvas.height + 4; // calculation to move the page up 
                this.scrolling(move); // passes the currentYPosition - the canvas height + the additional space added to the font size to scrolling
                this.currentYPosition = this.currentYPosition - move; // changes the current Y position to move page
            }
        };
        Console.prototype.scrolling = function (move) {
            var img = _Canvas.getContext("2d").getImageData(0, 0, _Canvas.width, this.currentYPosition + _FontHeightMargin); // records canvas state
            this.clearScreen(); // clear canvas to move page up
            _Canvas.getContext("2d").putImageData(img, 0, -move); // re prints canvas 
        };
        Console.prototype.backSpace = function () {
            if (this.currentXPosition <= 0) {
                this.currentXPosition = _WrapLinePos[_WrapLinePos.length - 1].X;
                this.currentYPosition = _WrapLinePos[_WrapLinePos.length - 1].Y;
                _WrapLinePos.pop();
            }
            var lastCharacterLine = this.buffer[this.buffer.length - 1];
            var xos = _DrawingContext.measureText(this.currentFont, this.currentFontSize, lastCharacterLine);
            this.currentXPosition = this.currentXPosition - xos;
            // redrawing the input in correct position 
            _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - _DefaultFontSize, this.currentXPosition + xos, this.currentYPosition + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize));
            // actually doing the backspace 
            this.buffer = this.buffer.slice(0, -1);
        };
        Console.prototype.lineWrap = function () {
            _WrapLinePos.push({ X: this.currentXPosition, Y: this.currentYPosition });
            this.advanceLine();
            this.currentXPosition = 0;
        };
        Console.prototype.commandRecall = function (retVal) {
            _OsShell.shellCls(retVal);
            _OsShell.putPrompt();
            this.buffer = retVal.join("");
            _StdOut.putText(this.buffer);
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
