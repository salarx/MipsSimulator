
// Read rs section of binary MIPS instruction which
// is indices between 6 and 11.
// Params:
//	string of MIPS 32 bit binary instruction
// Return:
//	decimal value of rs
function parseRs(codeString) {

	var rs = "";

	for(var i = 6; i < 11; i++) {
		rs += codeString.charAt(i);
	}

	return parseInt(rs, 2);
}

// Read rt section of binary MIPS instruction which
// is indices between 11 and 16.
// Params:
//	string of MIPS 32 bit binary instruction
// Return:
//	decimal value of rt
function parseRt(codeString) {

	var rt = "";

	for(var i = 11; i < 16; i++) {
		rt += codeString.charAt(i);
	}

	return parseInt(rt, 2);
}

// Read rd section of binary MIPS instruction which
// is indices between 16 and 21.
// Params:
//	string of MIPS 32 bit binary instruction
// Return:
//	decimal value of rd
function parseRd(codeString) {

	var rd = "";

	for(var i = 16; i < 21; i++) {
		rd += codeString.charAt(i);
	}

	return parseInt(rd, 2);
}

// Read offset section of binary MIPS instruction which
// is indices between 16 and 32.
// Params:
//	string of MIPS 32 bit binary instruction
// Return:
//	decimal value of offset
function parseOffset(codeString) {

	var offset = "";

	for(var i = 16; i < codeString.length; i++) {
		offset += codeString.charAt(i);
	}

	return parseInt(offset, 2);
}

// Read immediate section of binary MIPS instruction which
// is indices between 16 and 32. Check whether the value is
// negative and convert appropriately.
// Params:
//	string of MIPS 32 bit binary instruction
// Return:
//	decimal value of immediate
function parseImm(codeString) {

	var imm = "";

	for(var i = 16; i < codeString.length; i++) {
		imm += codeString.charAt(i);
	}

	// Check immediate is negative
	imm = parseInt(imm, 2);
	imm = uintToInt(imm, 10);

	return imm;
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

// MIPS INSTRUCTIONS

// add rd, rs, rt
// rd = rs + rt
// 0000 00ss ssst tttt dddd d000 0010 0000
function decodeAdd(codeString) {

	var rs = parseRs(codeString);
	var rt = parseRt(codeString);
	var rd = parseRd(codeString);

	return "ADD R" + rd + ", R" + rs + ", R" + rt;
}

// addi rs, rt, imm
// rt = rs + imm
// 0010 00ss ssst tttt iiii iiii iiii iiii
function decodeAddi(codeString) {

	var rs = parseRs(codeString);
	var rt = parseRt(codeString);
	var imm = parseImm(codeString);

	return "ADDI R" + rt + ", R" + rs + ", " + imm;
}

// beq rs, rt, offset
// if(rs == rt) advance pc offset << 2
// 0001 00ss ssst tttt iiii iiii iiii iiii
function decodeBranchOnEqual(codeString) {

	var rs = parseRs(codeString);
	var rt = parseRt(codeString);
	var offset = parseOffset(codeString);

	return "BEQ R" + rs + ", " + rt + ", " + offset;
}

// bne rs, rt, offset
// if(rs != rt) advance pc offset << 2
// 0001 01ss ssst tttt iiii iiii iiii iiii
function decodeBranchNotEqual(codeString) {

	var rs = parseRs(codeString);
	var rt = parseRt(codeString);
	var offset = parseOffset(codeString);

	return "BNE R" + rs + ", " + rt + ", " + offset;
}

// lw rt, offset(rs)
// rt = MEM[rs + offset]
// 1000 11ss ssst tttt iiii iiii iiii iiii
function decodeLoadWord(codeString) {

	var rs = parseRs(codeString);
	var rt = parseRt(codeString);
	var offset = parseOffset(codeString);

	return "LW R" + rt + ", " + offset + "(R" + rs + ")";
}

// sw rt, offset(rs)
// MEM[rs + offset] = rt
// 1010 11ss ssst tttt iiii iiii iiii iiii
function decodeStoreWord(codeString) {

	var rs = parseRs(codeString);
	var rt = parseRt(codeString);
	var offset = parseOffset(codeString);

	return "SW R" + rt + ", " + offset + "(R" + rs + ")";
}

// slt rd, rs, rt
// if(rs < rt) rd = 1, else rd = 0
// 0000 00ss ssst tttt dddd d000 0010 1010
function decodeSetOnLessThan(codeString) {

	var rs = parseRs(codeString);
	var rt = parseRt(codeString);
	var rd = parseRd(codeString);

	return "SLT R" + rd + ", R" + rs + ", R" + rt;
}

// sub rd, rs, rt
// rd = rs - rt
// 0000 00ss ssst tttt dddd d000 0010 0010
function decodeSub(codeString) {

	var rs = parseRs(codeString);
	var rt = parseRt(codeString);
	var rd = parseRd(codeString);

	return "SUB R" + rd + ", R" + rs + ", R" + rt;
}
