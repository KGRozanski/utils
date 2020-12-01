const readline = require('readline');

module.exports = class Asker {
    constructor(questionsList, mode) {
        // List of questionsList to ask:
        this.questionsList = questionsList;
        /* 
            Available modes:
            - "examiner": count points (DEFAULT)
            - "indagator": only ask questionsList and return answers
        */
        this.mode = mode;
        // For examiner mode:
        this.points = 0;
        // For indagator mode:
        this.answers = [];
        // Question pointer
        this.questionIndex = 0;
        // Read line interface
        this.readLine = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });
    }

    ask(question, answer) {
        this.readLine.question(question + '\n', (userInput) => {
            switch (this.mode) {
                case 'examiner':
                    if(userInput === answer) {
                        console.log('Correct!');
                        this.readLine.pause();
                    } else {
                        console.log('No.')
                        this.ask(question, answer);
                    }
                    break;
            
                default:
                    this.answers.push(userInput);
                    this.readLine.pause();
                    break;
            }
        });
    }

    start() {
        if(this.mode == 'examiner') {
            console.warn('\x1b[43m\x1b[30mWARNING: Examiner mode is not supported yet.\x1b[0m');
        }
        return new Promise((resolve) => {
            this.readLine.on('pause', () => {
                this.questionIndex++;
                if(this.questionsList.length > this.questionIndex) {
                    this.ask(
                        this.questionsList[this.questionIndex][0], 
                        this.questionsList[this.questionIndex][1]
                    );
                } else {
                    resolve(this.answers);
                }
            });
            this.ask(this.questionsList[0][0], this.questionsList[0][1]);
        });
    }
}