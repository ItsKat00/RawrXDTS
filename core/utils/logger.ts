import 'colors';
import { getTimeAndDate } from './util';
type Severety = 'info' | 'warning' | 'error';
export class Logger {
    moduleName: string;
    constructor(name: string){
        this.moduleName = name;
    }
    log(input: string, severety: Severety = 'info') {
        let logColor = 'green';
        switch (severety){
            case 'warning':
                logColor = 'yellow';
                break;
            case 'error':
                logColor = 'red';
                break;
        }
        console.log(('['+getTimeAndDate()+'] ['+this.moduleName+']: '+input)[logColor as any]);
    }
}