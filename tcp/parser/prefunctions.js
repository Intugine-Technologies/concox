const fetch_start_bit = (input) => input.slice(0, 4);
const fetch_stop_bit = (input) => input.slice(-4);
// const fetch_protocol_no = (input) => input.slice();
// const fetch_packet_length = (input) => {

// };
module.exports = (input) => {
	return {
		start_bit: fetch_start_bit(input),
		stop_bit: fetch_stop_bit(input)
	}
};