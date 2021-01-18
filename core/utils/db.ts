// here we go...
import { stringify } from 'querystring';
import { Client as PGClient } from 'ts-postgres';
import { Logger } from './logger';
const types = require('pg').types
let dbClient;
let dbInfo: any;
const logger = new Logger('DBLib')

export interface TablePropertiesDef{
    name: string;
    pkey?: string[];
    colNames: string[];
    colTypes: string[];
}

export let tableProperties: TablePropertiesDef[]

// checks table properties to make sure needed data is mostly correct.
function checkTablePropertiesData() {
    
}


function createNewClient() {
	logger.log('Creating new client.', 'info')
	dbClient = new PGClient({
		user: dbInfo.user,
		password: dbInfo.pass,
		host: dbInfo.host,
		database: dbInfo.db,
		port: dbInfo.port
	});
}
