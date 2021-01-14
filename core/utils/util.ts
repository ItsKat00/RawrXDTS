import { Message, MessageEmbed } from 'discord.js';
import fs from 'fs'

// owo
export function getRandom(min: number, max: number): number {
	return Math.floor(Math.random() * (max-min+1) + min);
}

// lil bit of magic here
export function getRandColor(): string {
	const red = getHex(getRandom(0, 255));
	const green = getHex(getRandom(0, 255));
	const blue = getHex(getRandom(0, 255));
	return red + green + blue;
}

// and a lil bit more here
function getHex(num: number): string {
	let hex = Number(num).toString(16);
	if (hex.length < 2)
		hex = "0" + hex;
	return hex;
}

export function getMessageEmbed(title: string, description: string = 'LAZY DEV HAHA', footer: string): MessageEmbed {
    return new MessageEmbed()
        .setTitle(title)
        .setColor(getRandColor())
        .setDescription(description)
        .setFooter(footer)
}

// Chris' cool shit
export interface OptionDef {
    name: string;
    description: string;
    usage: string;
    helpFull: string;
    argCount: number;
}

export function makeOption(name: string, description: string, args: string[]): OptionDef {
    let usage: string = '--'+name;
    if (args.length > 0)
        usage += ' '+args.join(' ');
    let help: string = '`'+usage+'`\n'+description;
    return {
        name: name,
        description: description,
        usage: usage,
        helpFull: help,
        argCount: args.length
    };
}

export interface CommandDef {
    name: string;
    description: string;
    options: OptionDef[];
    usage: string;
    helpFull: string;
    exec: CommandFunction;
    hidden: boolean;
}

interface CommandFunction {
    (message: Message, args: string[], options: any): void;
}

export function makeCommand(name: string, description: string, argumentHelp: string, options: OptionDef[], execFunc: CommandFunction, hidden: boolean = false): CommandDef{
    let usage: string = name;
    if (options.length > 0)
        usage += ' [options...]';
    if (argumentHelp.length > 0)
        usage += ' '+argumentHelp;
    
    let help: string = usage+'\n'+description;
    if (options.length > 0)
        help += '\n\n**Options:**\n'+options.map(o => o.helpFull).join('\n');
    
    return {
        name: name,
        description: description,
        options: options,
        usage: usage,
        helpFull: help,
        exec: execFunc,
        hidden: hidden
    }
}

export function readJSON(fileName:string): object {
    const data: object = fs.readFileSync(fileName);
    return JSON.parse(new String(data).toString());
}

export function getTimeAndDate(use12h: boolean = true): string {
    let today: Date = new Date();
    let hours: number = today.getHours();
    let minutes: number = today.getMinutes();
    let seconds: number = today.getSeconds();
    let dateFull: string = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
    let meridiemIndicator: string = ' (EST)';
    if (use12h){
        if (hours > 12){
            hours -= 12;
            meridiemIndicator = ' PM (EST)';
        }
        meridiemIndicator = ' AM (EST)';
    }
    let minString: string = minutes < 10 ? '0'+minutes : minutes.toString();
    let secString: string = seconds < 10 ? '0'+seconds : seconds.toString();
    return hours+':'+minString+':'+secString+meridiemIndicator+' '+dateFull;
}