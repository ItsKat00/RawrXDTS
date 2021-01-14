import { ClientUser, DiscordAPIError, Guild, Message, Snowflake, TextChannel } from 'discord.js';
import {Client} from 'discord.js';
const client = new Client();
export const dClient = client;
import {readJSON} from './utils/util';
//import {initConnection} from './utils/db';
import {config} from './config';

// log in
// I placed this down here, vs in my js codebase because importing modules takes a while, where as 
// logging in doesn't...
console.log('Logging in...');
client.login(config.bots.test.apiKey)
    .then(() => console.log('Logged in!'))
    .catch(e => console.log(e));
client.on('ready', () => {
    client.user?.setActivity('for &help', {'type': 'WATCHING'}) // revisit this line
        .catch(e => console.log('Error setting activity: '+e));
    onLogin().then(() => console.log('Ready!'));
})

// add them event listeners and start loading modules.
import {checkCommand} from './main';
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
        console.log('resmgs.json not found ya doofus.');
        return;
    }
    const guild: Guild | null = client.guilds.resolve(ids.guild);
    if (guild){
        const func = async function (){
            const channel: TextChannel = guild.channels.resolve(ids.channel) as TextChannel;
            if (channel){
                const msg: Message = await channel.messages.fetch(ids.messageID);
                if (msg){
                    msg.react('😄').catch(e => console.log(e))
                    if (ids.userID != config.botAdmins.owner)
                        msg.channel.send('you can\'t drown me bitch');
                }
                else
                    console.log('message not found in channel: '+channel.name);
            }
            else
                console.log('channel not found in guild: '+guild.name);
        }
        if (!guild.available){
            console.log('guild not available, waiting...');
            setTimeout(func, 1000);
        }
        else
            await func();
    }
    else{
        console.log('guild not found!\n'+JSON.stringify(ids));
    }
}


// nice