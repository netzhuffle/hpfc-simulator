var parameterType = process.argv[2];
var parameterValue = process.argv[3];

var followers = require('./followers/' + parameterType + parameterValue + '.json');
var generator = require('./generator_functions');

function printPost(isFirstPost) {
	var post = generator.getPost(followers, isFirstPost);

	console.log();
	console.log(post);
}

printPost(true);
printPost(false);
printPost(false);
