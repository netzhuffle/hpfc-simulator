'use strict';

var fs = require('fs');
var mysql = require('mysql');

var parameterType = process.argv[2];
var parameterValue = process.argv[3];

var connection = mysql.createConnection({
	host     : 'localhost',
	port     : '8889',
	user     : 'root',
	password : 'root',
	database : 'hpfc'
});
connection.connect();

var postQuery;
if (parameterType === 'user') {
	postQuery = 'SELECT p.message, p.postid = (SELECT MIN(sp.postid) FROM bb1_posts sp WHERE sp.threadid = t.threadid) AS isfirstpost FROM bb1_posts p RIGHT JOIN bb1_threads t ON (p.threadid = t.threadid) WHERE p.userid = ? AND t.boardid IN (13, 14, 15, 16, 17, 19, 21, 26, 29, 30, 33, 37, 38, 48, 52, 53, 57, 64, 65, 69, 70, 71, 96, 100, 102, 106, 128, 130, 140)';
} else if (parameterType === 'board') {
	postQuery = 'SELECT p.message, p.postid = (SELECT MIN(sp.postid) FROM bb1_posts sp WHERE sp.threadid = t.threadid) AS isfirstpost FROM bb1_posts p RIGHT JOIN bb1_threads t ON (p.threadid = t.threadid) WHERE t.boardid = ?';
} else {
	throw new Error('second parameter: followers or tokens, third parameter: id');
}

connection.query(postQuery, [parameterValue], function(error, rows, fields) {
	if (error) {
		connection.destroy();
		throw error;
	}

	var tokenCollection = [];

	rows.forEach(function(row) {
		let message = row.message;
		message = message.replace(/-/g, '- ');
		message = message.replace(/\n/g, '\n ');
		let words = message.split(' ');
		let tokens;
		if (row.isfirstpost) {
			tokens = ['SOF!'];
		} else {
			tokens = ['SOF'];
		}
		words.forEach(function(word, index) {
			tokens.push(word.trim());
		});
		tokens.push('EOF');
		tokenCollection.push(tokens);
		console.log(tokens);
	});

	fs.writeFile('tokens/' + parameterType + parameterValue + '.json', JSON.stringify(tokenCollection));

	console.log('===========');
	console.log(rows.length + ' Posts bearbeitet.');

	connection.destroy();
});

