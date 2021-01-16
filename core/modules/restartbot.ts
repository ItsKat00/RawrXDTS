import { Message } from "discord.js";
import fs from "fs";
import { log } from "../utils/logger";
import { makeCommand } from "../utils/util";
async function restart(message:Message, args: string[], options: string[]) {
    const data = {
        guild: message.guild?.id,
        channel: message.channel.id,
        messageID: message.id,
        userID: message.author.id
    }
    await message.react('😒');
    log('user '+message.author.tag+' restarted the bot.', '', 'warning');
    fs.writeFileSync('resmsg.json', JSON.stringify(data))
    process.exit(420)
}
export const cmd = makeCommand('res', 'Restarts the bot.', '', [], restart, true)