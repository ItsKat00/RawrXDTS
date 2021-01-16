import 'colors';
import { getTimeAndDate } from './util';

export type Severety = 'info' | 'warning' | 'error';

export function log(input: string, moduleName?: string, severety: Severety = 'info') {
    let moduleText: string = ': ';
    if (moduleName){
        moduleText = ' ['+moduleName+']: ';
    }
    let logColor = 'green';
    switch (severety){
        case 'warning':
            logColor = 'yellow';
            break;
        case 'error':
            logColor = 'red';
            break;
    }
    console.log(('['+getTimeAndDate()+']'+moduleText+input)[logColor as any]);
}