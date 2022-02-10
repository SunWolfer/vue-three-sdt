/**
 * 是否是空值(null 和 undefind)
 * @param {Object} data
 */
function isNull(data) {
	return data === null || data === undefined || data === ''
}

export function colorRGBtoHex(color) {
	let r = color.r
	let g = color.g
	let b = color.b
	let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
	return hex
}

export default {
	isNull
}
