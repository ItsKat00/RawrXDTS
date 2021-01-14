import { Message } from 'discord.js';
import { thisBot } from '..';
import { getMessageEmbed } from '../utils/util';

// >:D
interface ConversionList {
    [units: string]: (temp: number) => number
}

const conversions: ConversionList = {
	CF: temp => (temp * 9 / 5) + 32,
	CK: temp => temp + 273.15,
	FC: temp => (temp - 32) * 5 / 9,
	FK: temp => (temp - 32) * 5 / 9 + 273.15,
	KC: temp => temp - 273.15,
	KF: temp => (temp - 273.15) * 9 / 5 + 32
};
const usageMessage = 'Usage: `'+thisBot.prefix+' conv <temperature<C|F|K>> <C|F|K>`'
function convert(message: Message, args: string[], options: string[]) {
    if (args.length < 2){
        message.channel.send(usageMessage);
        return;
    }
    const startTempWithUnit = args[0].toUpperCase();
	const startTemp = parseFloat(startTempWithUnit);
	const startUnit = startTempWithUnit.replace(/^\d+\.?\d*([CFK])$/, '$1'); // hey saul look what I did
	const resultUnit = args[1].toUpperCase();
	
	if (!resultUnit.match(/^[CFK]$/)) {
		message.channel.send('`' + resultUnit + '` is not a valid temperature unit!');
		return;
	}
	if (Number.isNaN(startTemp)) {
		message.channel.send('`' + startTempWithUnit + '` is not a valid temperature!')
		return;
	}
	if (startUnit.length == 0) {
		message.channel.send('there seems to be no unit to convert from...\n' + 'to: ' + resultUnit + ' input: ' + startTempWithUnit + ' temp: ' + startTemp + '(tUnit: ' + startUnit + ' tInt.l / tFull.l: ' + (startTemp+'').length + ' / ' + startTempWithUnit.length + ')')
		return;
	}
		
	const resultTemp = startUnit == resultUnit ? startTemp : conversions[startUnit + resultUnit](startTemp);
	message.channel.send(getMessageEmbed('Conversion from ' + startUnit + ' to ' + resultUnit + ':', startTemp + '\u00B0' + startUnit + ' -> ' + resultTemp + '\u00B0' + resultUnit, ''));
}