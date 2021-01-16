import { ClientUser, DiscordAPIError, Guild, Message, Snowflake, TextChannel } from 'discord.js';
import {Client} from 'discord.js';
const client = new Client();
export const dClient = client;
import {readJSON} from './utils/util';
//import {initConnection} from './utils/db';
import {config} from './config';
export const thisBot: BotConfig = config.bots.test;
import { log } from './utils/logger';
import {checkCommand} from './main';

export interface BotConfig {
    apiKey: string;
    prefix: string;
    inviteURL: string;
}

// Change which bot this is on the line below.
// log in
// I placed this down here, vs in my js codebase because importing modules takes a while, where as 
// logging in doesn't...
log('Logging in...', 'core');
client.login(thisBot.apiKey)
    .then(() => log('Logged in!', 'core'))
    .catch(e => log(e, 'core', 'error'));
client.on('ready', () => {
    client.user?.setActivity('for &help', {'type': 'WATCHING'}) // revisit this line
        .catch(e => log('Error setting activity: '+e, 'core', 'error'));
    onLogin().then(() => log('Ready!', 'core'));
})

// add them event listeners and start loading modules.
client.on('message', checkCommand);
//import {newMember} from './utils/db';
//client.on('guildMemberAdd', member => newMember(member))

interface RestartData {
    guild: Snowflake;
    channel: Snowflake;
    messageID: Snowflake;
    userID: Snowflake;
}

async function onLogin(){
    //initConnection(config.dbCredentials)
    let ids: RestartData;
    try{
        ids = readJSON('./resmsg.json') as RestartData;
    }
    catch{
        log('resmgs.json not found ya doofus.', 'core', 'warning');
        return;
    }
    const guild: Guild | null = client.guilds.resolve(ids.guild);
    if (guild){
        const func = async function (){
            const channel: TextChannel = guild.channels.resolve(ids.channel) as TextChannel;
            if (channel){
                const msg: Message = await channel.messages.fetch(ids.messageID);
                if (msg){
                    msg.react('😄').catch(e => log(e, 'core', 'error'))
                    if (ids.userID != config.botAdmins.owner)
                        msg.channel.send('you can\'t drown me bitch');
                }
                else
                    log('message not found in channel: '+channel.name, 'core', 'warning');
            }
            else
                log('channel not found in guild: '+guild.name, 'core', 'warning');
        }
        if (!guild.available){
            log('guild not available, waiting...', 'core', 'warning');
            setTimeout(func, 1000);
        }
        else
            await func();
    }
    else{
        log('guild not found!\n'+JSON.stringify(ids), 'core', 'error');
    }
}