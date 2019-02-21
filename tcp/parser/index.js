const formatter = require('./formatter');

module.exports = (__str) => {
	if (__str.slice(0, 4) !== '7878') return null;
	if(__str.slice(-4) !== '0d0a') return null;
	return __str.split('0d0a').filter(i => i).map((i) => {
		let obj = {};
		return formatter(__str.slice(6, 8), i + "0d0a");
	});
};