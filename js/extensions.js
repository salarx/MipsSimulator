// Remove empty elements from array
// Params:
//  None
// Return:
//  array with non-empty elements
Array.prototype.removeEmptyElements = function removeEmptyElements() {

  var newArray = [];

  for(var i = 0; i < this.length; i++) {
    if(!this[i].isNullOrEmpty()) {
      newArray.push(this[i]);
    }
  }

  return newArray;
}

// Check if string has value and isn't empty
// Params:
//  None
// Return:
//  bool: whether string is null or empty
String.prototype.isNullOrEmpty = function isNullOrEmpty() {
  return (!this || /^\s*$/.test(this));
}

// Convert unsigned decimal to signed
// Params:
//	uint: unsigned decimal
//	nbit: number base
// Return:
//	signed decimal
function uintToInt(uint, nbit) {

	nbit = +nbit || 32;

	uint <<= 32 - nbit;
	uint >>= 32 - nbit;

	return uint;
}
