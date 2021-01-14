import {Message} from 'discord.js'
import { getRandom, makeCommand } from '../utils/util'
const answers = [
    'it is certain',
	'it is decidedly so',
	'without a doubt',
	'yes - definitely',
	'you may rely on it',
	'as I see it, yes',
	'most likely',
	'outlook good',
	'yes',
	'signs point to yes',
	//'reply hazy, try again',
	//'ask again later',
	'better not tell you now',
	//'cannot predict now',
	//'concentrate and ask again',
	'ask again nicely, **bitch**',
	'that seems kinda rude, ya think?',
	'don\'t count on it',
	'my reply is no',
	'my sources say no',
	'outlook not too good',
	'very doubtful'
]
function ball(message: Message, args: string[], options: string[]) {
    message.channel.send('*Shaking the 8ball...')
        .then(m => setTimeout(() => m.edit(answers[getRandom(0, answers.length - 1)]), getRandom(1000, 5000)))
}

export const cmd = makeCommand("8ball", "Ask the 8ball your questions.", "[your question]", [], ball, false);