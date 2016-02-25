/* MIT licence, (c) 2014-2015 coredump Rapperswil, Jannis Grimm */

(function(exports) {

	/**
	 * Returns the list of possible following tokens
	 * 
	 * @param {Array<Array<string>>} currentFollowers - The list of tokens to put in the list (index 1: list with tokens following two tokens, index 2: ... three, index 3: ... four)
	 * @return {Array<string>} The list
	 */
	function getFollowerCollection(currentFollowers) {
		var collection = [];
		currentFollowers.forEach(function(list) {
			var newFollowers = [];
			var followerTokens = Object.getOwnPropertyNames(list);
			followerTokens.forEach(function(follower) {
				var repeat = list[follower];
				for (var i = 0; i < repeat; i++) {
					newFollowers.push(follower);
				}
			});
			if (newFollowers.length) {
				var ratio = collection.length / newFollowers.length + 1;
				for (var i = 0; i < ratio; i++) {
					collection = collection.concat(newFollowers);
				};
			}
		});
		return collection;
	}
	
	/**
	 * Creates a new headline and returns its tokens
	 * 
	 * @todo refactor to smaller functions
	 * 
	 * @param {Array<string>} history - The list of already generated tokens
	 * @param {object} followers - The markov chain
	 * @returns {Array<string>} List of tokens for this post
	 */
	function getPostTokens(history, followers) {
		var lastToken = history[history.length - 1];
		if (lastToken == 'EOF') {
			return history;
		}
	
		var currentFollowers = [];
		if (lastToken == 'SOF' || lastToken == 'SOF!') {
			currentFollowers[0] = followers[lastToken] || {};
		}
		var doubleToken = history[history.length - 2] + ' ' + lastToken;
		currentFollowers[1] = followers[doubleToken] || {};
		var tripleToken = history[history.length - 3] + ' ' + history[history.length - 2] + ' ' + lastToken;
		currentFollowers[2] = followers[tripleToken] || {};
		var quadrupleToken = history[history.length - 4] + ' ' + history[history.length - 3] + ' ' + history[history.length - 2] + ' ' + lastToken;
		currentFollowers[3] = followers[quadrupleToken] || {};
		
		var randomizer = getFollowerCollection(currentFollowers);
	
		while (true) {
			if (!randomizer.length) {
				return history;
			}
			var nextIndex = Math.floor(randomizer.length * Math.random());
			var token = randomizer.splice(nextIndex, 1);
			history.push(token);
			if (token == 'EOF') {
				return history;
			}
			var nextHistory = getPostTokens(history, followers);
			if (nextHistory[nextHistory.length - 1] == 'EOF') {
				return nextHistory;
			} else {
				history.pop();
			}
		};
	}
	
	/**
	 * Counts the occurrences of a string in another string
	 * @param {string} needle - The string to count
	 * @returns {number} The number of occurrences
	 */
	String.prototype.countString = function(needle) {
		return (this.match(new RegExp(needle, 'g')) || []).length
	}
	
	/**
	 * Fixes some character uses.
	 * 
	 * Remove space after dashes.
	 * @param {string} post - The string to fix
	 * @returns {string} The fixed string
	 */
	function fixPart(post) {
		post = post.replace(/- /g, '-');
		return post;
	}
	
	/**
	 * Returns a newly created headline
	 * 
	 * @param {Array<Array<string>>} followers - The markov chain
	 * @param {boolean} isFirstPost - Generate the first post of a thread
	 * @returns {string} The post
	 */
	exports.getPost = function(followers, isFirstPost) {
		var startToken = 'SOF';
		if (isFirstPost) {
			startToken += '!';
		}
		var postTokens = getPostTokens([startToken], followers);
		var post = postTokens.slice(1, -1).join(' ');
	
		return fixPart(post);
	}

})(typeof exports === 'undefined' ? this.headlineGenerator = {} : exports); // hack to work in the webbrowser and as a node.js module
