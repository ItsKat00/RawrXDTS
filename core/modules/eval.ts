import { Message } from "discord.js";
import { config } from "../config";
import { getMessageEmbed, makeCommand } from "../utils/util";

function exec(message: Message, args: string[], options: string[]) {
    if (message.author.id != (config.botAdmins.owner || config.botAdmins.helper)){
        message.channel.send('whacha think you\'re doing?')
        // add db module stuff later...
    }
    else{
        message.channel.send(getMessageEmbed('Eval results:', eval(args.join(' '))))
    }
}

export const cmd = makeCommand('eval', 'Allows the usage of raw JS.', '', [], exec, true)