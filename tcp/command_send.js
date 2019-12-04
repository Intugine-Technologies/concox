const ascii_to_hex = (__str) => {
	return __str.split("").map(k => Number(k.charCodeAt(0)).toString(16)).join("")
};

// console.log(ascii_to_hex("Battery:2.97V,NORMAL; GPRS:Link Up GSM Signal Level:Strong; GPS:Successful positioning; SVS Used in fix:12(12); , GPS Signal Level:31,31,27,33,38,31,30,36,34,24,31,18  Defense:OFF; "));

const prefix = "7878";
const suffix = "0d0a";
const info_serial = "01";
const server_flag_bit = "00000000";
module.exports = () => {
	const command = "status#"
	return "787811800B000000007374617475732300012A730D0A";
};