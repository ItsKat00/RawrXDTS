import { Message } from 'discord.js';
import { getMessageEmbed, makeCommand } from '../utils/util';
import { cmds } from '../main'
function help(message:Message, args: string[], options: string[]) {
    if (args.length > 0){
        const cmd = cmds.find(cmd => cmd.name == args[0].toLowerCase());
        if (cmd == null){
            message.channel.send('No command with the name '+args[0]);
            return;
        }
        message.channel.send(getMessageEmbed('Help for '+cmd.name, cmd.helpFull, '<> = required | [] = optional'));
    }
    else{
        let lines = cmds.map(cmd => '`'+cmd.usage+'`\n\t'+cmd.description);
        message.channel.send(getMessageEmbed('Available Commands', lines.join('\n\n'), '<> = required | [] = optional | Use help <command> for option info'));
    }
}
export const cmd = makeCommand('help', 'Provides information on available commands and how to use them.', '[command]', [], help, false)