let commands: CommandDef[] = [];
export const cmds = commands
// exports.cmds = commands; // had to use this style because ts was being a lil shit.

let replies: RepliesDef[] = [];
import { Message } from 'discord.js';
import fs from 'fs';
import { config } from './config';
import { Logger } from './utils/logger';
import { CommandDef } from './utils/util';
const logger = new Logger('core')
interface RepliesDef {
    text: string,
    response: string
}

addModules()
addReply('ping', 'pong!');
addReply('chrisisnob', 'he really do be like that');
addReply('nom', '*noms*');
addReply('fucking long ass bullshit idk man im not a coder', '|bruh|');
addReply('nerd', 'is coolest dino');
addReply('mojo', 'is a furry cult god');
addReply('seren', 'seren stinks');
addReply('john', 'is that a jojo reference?');
addReply('chris', 'is a scalie');
addReply('ayashi', 'he\'s cool ¯\\_(ツ)_/¯');
addReply('coinflip', '<3coinflip');

function addModules() {
    let errCount: number = 0;
    let moduleList: string[] = fs.readdirSync('./modules');
    for (let i: number = 0; i < moduleList.length; i++){
        errCount += addModule(moduleList[i]); // addModule function returns 0 typically, unless some sort of error happens
    }
    let severety: any = 'info';
    if (errCount > 0)
        severety = 'warning';
    logger.log('Loaded '+moduleList.length+' modules with '+errCount+' errors', severety);
}

function addModule(name: string): number {
    const {cmd} = require('./modules/' + name);
	logger.log('Added module '+name);
	if(cmd == null){
		logger.log('Warning: module '+name+' does not export a command.', 'warning');
		return 1;
	}
	else if(Array.isArray(cmd)) {
		// some modules export an array of commands instead of a single command
		for(let eachCmd of cmd)
			commands.push(eachCmd);
	} else
		commands.push(cmd);
	return 0;
}

function addReply(text: string, response: string) {
    replies.push({
        text: text,
        response: response
    })
}

export interface Options {
    [option: string]: string | string[] | boolean;
}

export function checkCommand(message: Message) {
    let msg: string = message.content;
    if (msg.charAt(0) != config.bots.test.prefix){
        return;
    }
    msg = msg.substring(1, msg.length);

    let args: string[] = msg.split(' ');
    const name: string | undefined = args.shift();

    for (let cmd of commands){
        if (cmd.name == name){
            let options: Options = {};
            while (args.length > 0 && args[0].startsWith('--')){
                let optionName = (args.shift() as string).substring(2).toLowerCase();
                if (optionName.length == 0){
                    break;
                }

                // look for a registered option with the given name.
                const matchingOption = cmd.options.find(o => o.name == optionName);
                if (!matchingOption){
                    message.channel.send('Invalid optuib --'+optionName); // no option found.
                    return;
                }

                // we've got a valid option -- consume the arguments. (noms)
                if (matchingOption.argCount == 0)
                    options[matchingOption.name] = true; // just a flag.
                else if (matchingOption.argCount == 1){
                    if (args.length == 0){
                        message.channel.send('Missing parameters for option `'+matchingOption.name+'` in command `'+cmd.name+'`');
                        return;
                    }
                    options[matchingOption.name] = args.shift() as string;
                }
                else{
                    if (args.length < matchingOption.argCount){
                        message.channel.send('Missing parameters for option '+matchingOption.name+' in command '+cmd.name);
                        return;
                    }
                    options[matchingOption.name] = args.splice(0, matchingOption.argCount) as string[];
                }
            }
            cmd.exec(message, args, options)
            return;
        }
    }
    // either not a command or reply...
    const replyMatch = replies.find(reply => msg.match(new RegExp(reply.text, 'i')) != null);
    if (replyMatch != null)
        message.channel.send(replyMatch.response);
    else{
        logger.log('unknown command: '+ msg, 'warning'); // neither a command or reply :(
        message.channel.send('what?');
    }
}