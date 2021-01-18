import { ClientUser, DiscordAPIError, Guild, Message, Snowflake, TextChannel } from 'discord.js';
import {Client} from 'discord.js';
const client = new Client();
export const dClient = client;
import {readJSON} from './utils/util';
//import {initConnection} from './utils/db';
import {config} from './config';
export const thisBot: BotConfig = config.bots.test;
import { Logger } from './utils/logger';
import {checkCommand} from './main';
const logger = new Logger('core')
export interface BotConfig {
    apiKey: string;
    prefix: string;
    inviteURL: string;
}

// Change which bot this is on the line below.
// log in
// I placed this down here, vs in my js codebase because importing modules takes a while, where as 
// logging in doesn't...
logger.log('Logging in...');
client.login(thisBot.apiKey)
    .then(() => logger.log('Logged in!'))
    .catch(e => logger.log(e, 'error'));
client.on('ready', () => {
    client.user?.setActivity('for &help', {'type': 'WATCHING'}) // revisit this line
        .catch(e => logger.log('Error setting activity: '+e, 'error'));
    onLogin().then(() => logger.log('Ready!'));
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
        logger.log('resmgs.json not found ya doofus.', 'warning');
        return;
    }
    const guild: Guild | null = client.guilds.resolve(ids.guild);
    if (guild){
        const func = async function (){
            const channel: TextChannel = guild.channels.resolve(ids.channel) as TextChannel;
            if (channel){
                const msg: Message = await channel.messages.fetch(ids.messageID);
                if (msg){
                    msg.react('😄').catch(e => logger.log(e, 'error'))
                    if (ids.userID != config.botAdmins.owner)
                        msg.channel.send('you can\'t drown me bitch');
                }
                else
                    logger.log('message not found in channel: '+channel.name, 'warning');
            }
            else
                logger.log('channel not found in guild: '+guild.name, 'warning');
        }
        if (!guild.available){
            logger.log('guild not available, waiting...', 'warning');
            setTimeout(func, 1000);
        }
        else
            await func();
    }
    else{
        logger.log('guild not found!\n'+JSON.stringify(ids), 'error');
    }
}