const formatter = require('./formatter');

module.exports = (__str) => {
  const __data = __str.toLowerCase();
	if (['7878', '7979'].indexOf(__data.slice(0, 4)) === -1) return null;
	if(__data.slice(-4) !== '0d0a') return null;
	return __data.split('0d0a').filter(i => i).map((i) => {
		return formatter(i + "0d0a");
	});
};
