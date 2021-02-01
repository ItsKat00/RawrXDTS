// here we go...
import { Client as PGClient, QueryResult} from 'pg';
import { Logger } from './logger';
let dbClient: PGClient;
let dbInfo: DBCredentialsDef;
const logger = new Logger('DB')
const emitter = require('events').EventEmitter
export const dbEmitter = new emitter()

export type SimpleColTypes = 'VARCHAR' | 'TEXT' | 'INTEGER'
export interface TablePropertiesDef{
    name: string;
    pkey: string;
    pkeyType: SimpleColTypes;
    colNames: string[];
    colTypes: SimpleColTypes[];
}

export interface DBCredentialsDef {
    user: string;
    password: string;
    hostIP: string;
    database: string;
    dbPort: number;
}

export let tableProperties: TablePropertiesDef[] = [];


// checks table properties to make sure needed data is mostly correct.
// Because of TS types and type defs, this almost isn't needed... seems that I've just got to check one thing lol
function checkTablePropertiesData() {
    let errorList: string[] = [];
    for (let i: number = 0; i < tableProperties.length; i++){
        if (tableProperties[i].colNames.length != tableProperties[i].colTypes.length)
            errorList.push('Error: Error: Number of column names != number of column types for table properties: ' + tableProperties[i].name)
    }
    if (errorList.length > 0){
        let suffix = '';
		if (errorList.length > 1)
			suffix = 's';
		logger.log('Checked '+tableProperties.length+' table properties with '+errorList.length+' error'+suffix+':\n'+errorList.join('\n'), 'error');
	}
	else
		logger.log('Checked '+tableProperties.length+' table properties with no errors or warnings');
}

function createNewClient() {
	logger.log('Creating new client.')
	dbClient = new PGClient({
		user: dbInfo.user,
		password: dbInfo.password,
		host: dbInfo.hostIP,
		database: dbInfo.database,
		port: dbInfo.dbPort
	});
}

export function initConnection(dbCreds: DBCredentialsDef = dbInfo) {
    dbInfo = dbCreds;
    checkTablePropertiesData();
    createNewClient();
    logger.log('Connecting to DB...');
    dbClient.connect()
        .then(() => {
            logger.log('Successfully connected to database.');
            checkForTable()
            runMissedQueries() // consider writing these to a file in case the bot is rebooted. that way, missed queries aren't lost.
            dbEmitter.emit('ready')
        })
        .catch(e => {
            logger.log('Error while connecting...\n'+e, 'error');
            dbEmitter.emit('error')
        });
}

let missedQuery: string[] = [];
function runMissedQueries() {
    if (missedQuery.length > 0){
        logger.log('Running missed queries.');
        let qList: string[] = missedQuery;
        for (let i: number = 0; i < qList.length - 1; i++){
            dbClient.query(qList[i])
                .then(() => logger.log('Successfully ran missed query:\n'+qList[i]))
                .catch(e => logger.log(`Error while running missed query:\n ${qList[i]}\nUnsuccessful query data has been lost.`, 'error'))
        }
    }
    missedQuery.splice(0);
}

async function checkForTable() {
    for (let i: number = 0; i < tableProperties.length; i++){
        let res: QueryResult<any> = await dbClient.query('SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE table_name = \''+tableProperties[i].name+'\'');
        if (res.rows.length < 1){
            logger.log(`Table '${tableProperties[i].name}' does not exist. Creating...`);
            makeTable(tableProperties[i].name, tableProperties[i].colNames, tableProperties[i].colTypes, tableProperties[i].pkey, tableProperties[i].pkeyType)
        }
        else
            logger.log(`Table '${tableProperties[i].name}' exists, skipping creation.`);
    }
}

async function makeTable(tableName: string, colNames: string[], colTypes: string[], pkey: string, pkeyType: string) {
	let pk: string = pkey+' '+pkeyType+ ' PRIMARY KEY, ';
    let query = 'CREATE TABLE '+tableName+'('+pk+joinDataTables(colNames, colTypes).join(', ')+');';
	await dbClient.query(query)
	    .then(() => logger.log('Table \''+tableName+'\' was created successfully!'))
	    .catch(e => logger.log('Error while creating table \''+tableName+'\': ' + e));
}

function joinData(set1: string[], set2: string[]): string[]{
	let result: string[] = [];
	for (let i = 0; i < set1.length; i++){
		result.push(set1[i]+' = \''+set2[i]+'\'');
	}
	return result;
}
// slightly different syntax, used in makeTables()
function joinDataTables(set1: string[], set2: string[]): string[]{
	let result: string[] = [];
	for (let i = 0; i < set1.length; i++){
		result.push(set1[i]+' '+set2[i]);
	}
	return result;
}

function checkDBConnection(query: string): boolean {
    if (false){ // figure out a way to see if it's connected or not. for now, it's just kinda skipped.
        logger.log('DB query attempt with no active DB connection, or while DB is not ready.');
        logger.log('Query has been saved to be ran when database is ready.');
        missedQuery.push(query);
        createNewClient();
        initConnection();
        return false;
    }
    return true;
}

export function updateRecords(tableName: string, colNames: string[], colData: string[], pkeyName: string, pkeyData: string) {
    let query = 'UPDATE '+tableName+' SET '+joinData(colNames, colData).join(', ')+' WHERE '+pkeyName+' = \''+pkeyData+'\'';
	if (checkDBConnection(query))
		dbClient.query(query).catch(e => {
			logger.log('Error while editing data: '+e, 'error')
			logger.log(query, 'error');
        });
}

export async function getRecords<T>(tableName: string, colName?: string, rowName?: string): Promise<QueryResult<T>> {
    let queryAppend: string = '';
    if (colName && rowName){
        queryAppend = ' WHERE ' + colName + ' = \'' + rowName + '\'';
    }
    else if ((colName = undefined) != (rowName = undefined)) // check to see if only one is true. this usually only happens when the function is entered incorrectly.
        logger.log('Only 1 of 2 required fields are used. Retrieving all records.', 'error');
    let query: string = 'SELECT * FROM '+tableName+queryAppend;
    logger.log(query)
    let qRes: QueryResult<T> = await dbClient.query<T, T[]>(query)
    return qRes;
}

// beep boop 00100100

export function addColumn(tableName: string, colName: string, type: SimpleColTypes): string {
    let query: string = 'ALTER TABLE '+tableName+' ADD COLUMN '+colName+' '+type;
	if (checkDBConnection(query))
        dbClient.query(query)
            .catch(e => logger.log('Error while adding new column: '+e, 'error'));
    return colName;
}

export function addRow(tableName: string, colNames: string[], rowData: string[]){
    let query: string = 'INSERT INTO '+tableName+'('+colNames.join(',')+')VALUES(\''+rowData.join('\', \'')+'\')';
	if (checkDBConnection(query))
        dbClient.query(query)
        .catch(e => logger.log('Error while adding row: '+e));
}