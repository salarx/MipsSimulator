// MIPS INSTRUCTIONS

var registerStates = [];
var memoryStates = [];

/* Return the decimal value of binary from 
 * characters between 6 - 11 representing
 * rs in MIPS instructions */ 
function parseRs(codeString) {

	var rs = "";

	for(var i = 6; i < 11; i++) {
		rs += codeString.charAt(i);
	}

	return parseInt(rs, 2);
}

/* Return the decimal value of binary from 
 * characters between 11 - 16 representing
 * rt in MIPS instructions */ 
function parseRt(codeString) {

	var rt = "";

	for(var i = 11; i < 16; i++) {
		rt += codeString.charAt(i);
	}

	return parseInt(rt, 2);
}

/* Return the decimal value of binary from 
 * characters between 16 - 21 representing
 * rd in MIPS instructions */ 
function parseRd(codeString) {

	var rd = "";

	for(var i = 16; i < 21; i++) {
		rd += codeString.charAt(i);
	}

	return parseInt(rd, 2);
}

/* Return the decimal value of binary from 
 * characters between 16 - 32 representing
 * offset in MIPS instructions */ 
function parseOffset(codeString) {

	var offset = "";

	for(var i = 16; i < codeString.length; i++) {
		offset += codeString.charAt(i);
	}

	return parseInt(offset, 2);
}

/* Return the decimal value of binary from 
 * characters between 16 - 32 representing
 * immediate in MIPS instructions */ 
function parseImm(codeString) {

	var imm = "";

	for(var i = 16; i < codeString.length; i++) {
		imm += codeString.charAt(i);
	}

	// Check immediate is negative
	if(imm.charAt(0) == "1") {
		imm = parseInt(imm, 2);
		imm = uintToInt(imm, 10);
	}
	else {
		imm = parseInt(imm, 2);
	}

	return imm;
}

/* lw rt, offset(rs)
 * 1000 11ss ssst tttt iiii iiii iiii iiii*/
function loadWord(codeString) {
	
	var rs = parseRs(codeString);
	var rt = parseRt(codeString);
	var offset = parseOffset(codeString);

	instructions.push("LW R" + rt + ", " + offset + "(R" + rs + ") <br />");
}

/* sw rt, offset(rs)
 * 1010 11ss ssst tttt iiii iiii iiii iiii*/
function storeWord(codeString) {
	
	var rs = parseRs(codeString);
	var rt = parseRt(codeString);
	var offset = parseOffset(codeString);

	instructions.push("SW R" + rt + ", " + offset + "(R" + rs + ") <br />");

	memory[rs + offset] = registers["r" + rt];
}

/* add rd, rs, rt
 * rd = rs + rt
 * 0000 00ss ssst tttt dddd d000 0010 0000*/
function add(codeString) {

	var rs = parseRs(codeString);
	var rt = parseRt(codeString);
	var rd = parseRd(codeString);

	instructions.push("ADD R" + rd + ", R" + rs + ", R" + rt + "<br />");
}

/* addi rs, rt, imm
 * rt = rs + imm
 * 0010 00ss ssst tttt iiii iiii iiii iiii*/
function addi(codeString) {
	
	var i = 0;
	var rs = parseRs(codeString);
	var rt = parseRt(codeString);
	var imm = parseImm(codeString);

	instructions.push("ADDI R" + rt + ", R" + rs + ", " + imm + "<br />");
}

/* sub rd, rs, rt
 * rd = rs - rt
 * 0000 00ss ssst tttt dddd d000 0010 0010*/
function sub(codeString) {
	
	var rs = parseRs(codeString);
	var rt = parseRt(codeString); 
	var rd = parseRd(codeString);

	instructions.push("SUB R" + rd + ", R" + rs + ", R" + rt + "<br />");
}

/* slt rd, rs, rt
 * if rs is less than rt, rd = 1 else rd = 0
 * 0000 00ss ssst tttt dddd d000 0010 1010 */
function setLessThan(codeString) {
	
	var rs = parseRs(codeString);
	var rt = parseRt(codeString);
	var rd = parseRd(codeString);

	instructions.push("SLT R" + rd + ", R" + rs + ", R" + rt + "<br />");
}

/* beq rs, rt, offset
 * if(rs == rt) pc += offset * 4*/
function branchOnEqual(codeString) {
	
	var rs = parseRs(codeString);
	var rt = parseRt(codeString);
	var offset = parseOffset(codeString);

	instructions.push("BEQ R" + rs + ", " + rt + ", " + offset + "<br />");
}

/* bne rs, rt, offset
 * if(rs != rt) pc += offset * 4*/
function branchNotEqual(codeString) {
	
	var rs = parseRs(codeString);
	var rt = parseRt(codeString);
	var offset = parseOffset(codeString);

	instructions.push("BNE R" + rs + ", " + rt + ", " + offset + "<br />");
}






