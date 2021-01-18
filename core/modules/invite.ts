import { Message } from "discord.js";
import { thisBot } from "..";
import { getMessageEmbed, makeCommand } from "../utils/util";

function invite(message: Message, args: string[], options: string[]) {
    message.channel.send(getMessageEmbed('Invite me!', thisBot.inviteURL));
}

export const cmd = makeCommand("invite", "Gives invite link for the bot.", "", [], invite, false)