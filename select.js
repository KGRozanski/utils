const rl = require("readline");
const stdin = process.stdin;
const stdout = process.stdout;
const stderr = process.stderr;

module.exports = class Select {
    constructor(config) {
        let { question, options, pointer, color } = config;
        this.question = question; //string
        this.options = options; //array
        this._color = color; //string
        this.pointer = pointer || '>'; //string
        this.pointerIndex = 0;
        this.cursorCoordinates = {
            x: 0,
            y: 0
        };
    }

    hideCursor() {
        stdout.write("\x1B[?25l");
    }

    showCursor() {
        stdout.write("\x1B[?25h");
    }

    color(str, colorName = "yellow") {
        const colors = {
            "yellow": [33, 89],
            "blue": [34, 89],
            "green": [32, 89],
            "cyan": [35, 89],
            "red": [31, 89],
            "magenta": [36, 89]
        };
        const _color = colors[colorName];
        const start = "\x1b[" + _color[0] + "m";
        const stop = "\x1b[" + _color[1] + "m\x1b[0m";
        return start + str + stop;
    }

    pn(self, resolve) {
        return (c) => {
            switch (c) {
                case '\u0004': // Ctrl-d
                case '\r':
                case '\n':
                    return self.enter(resolve);
                case '\u0003': // Ctrl-c
                    return self.ctrlc();
                case '\u001b[A':
                    return self.upArrow();
                case '\u001b[B':
                    return self.downArrow();
            }
        }
    }

    upArrow() {
        let y = this.cursorCoordinates.y;
        rl.cursorTo(stdout, 0, y);
        stdout.write(this.options[y - 1]);
        if (this.cursorCoordinates.y === 1) {
            this.cursorCoordinates.y = this.options.length;
        } else {
            this.cursorCoordinates.y--;
        }
        y = this.cursorCoordinates.y;
        rl.cursorTo(stdout, 0, y);
        stdout.write(this.color(this.options[y - 1], this._color));
        this.pointerIndex = y - 1;
    }

    downArrow() {
        let y = this.cursorCoordinates.y;
        rl.cursorTo(stdout, 0, y);
        stdout.write(this.options[y - 1]);
        if (this.cursorCoordinates.y === this.options.length) {
            this.cursorCoordinates.y = 1;
        } else {
            this.cursorCoordinates.y++
        }
        y = this.cursorCoordinates.y;
        rl.cursorTo(stdout, 0, y);
        stdout.write(this.color(this.options[y - 1], this._color));
        this.pointerIndex = y - 1;
    }

    enter(resolve) {
        stdin.removeListener('data', this.pn);
        stdin.setRawMode(false);
        stdin.pause();
        this.showCursor();
        rl.cursorTo(stdout, 0, this.options.length + 1);
        resolve(this.pointerIndex);
    }

    ctrlc() {
        stdin.removeListener('data', this.pn);
        stdin.setRawMode(false);
        stdin.pause();
        this.showCursor();
    }

    start() {
        stdin.setEncoding('utf-8');
        stdin.setRawMode(true);
        stdout.write(this.question + '\n');

        for (let i = 0; i < this.options.length; i++) {
            this.options[i] = this.pointer + " " + this.options[i];
            if (i === 0) {
                // console.log('pointer: ', this.pointerIndex)
                this.options[i] += '\n';
                stdout.write(this.color(this.options[i], this._color));
            } else {
                this.options[i] += '\n';
                stdout.write(this.options[i]);
            }
            this.cursorCoordinates.y += 1;
        }

        this.cursorCoordinates.y = 1;

        stdin.resume();
        this.hideCursor();

        return new Promise((resolve) => {
            stdin.on("data", this.pn(this, resolve));
        })
    }
}