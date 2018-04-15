
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

function setRegisterDefault(registerNumber) {

	if(!registers[registerNumber]) {
		registers[registerNumber] = 0;
	}

}

function setMemoryDefault(memoryLocation) {

	if(!memory[memoryLocation]) {
		memory[memoryLocation] = 0;
	}

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

function ExecutionResult(type, registerState, memoryState, shouldBranch, branchOffset) {

	this.type = type;
	this.registerState = registerState;
	this.memoryState = memoryState;
	this.shouldBranch = shouldBranch;
	this.branchOffset = branchOffset;

}

// MIPS INSTRUCTIONS

// add rd, rs, rt
// rd = rs + rt
// 0000 00ss ssst tttt dddd d000 0010 0000
function add(instructionBinary, action) {

	var rs = parseRs(instructionBinary);
	var rt = parseRt(instructionBinary);
	var rd = parseRd(instructionBinary);

	var result;

	if(action == "decode") {
		return "ADD R" + rd + ", R" + rs + ", R" + rt;
	}
	else if(action == "execute") {
		var type = "R";

		setRegisterDefault(rs);
		setRegisterDefault(rt);

		var registerState = { register: rd, value: registers[rs] + registers[rt] };
		var memoryState = null;
		var shouldBranch = false;
		var branchOffset = 0;

		return new ExecutionResult(type, registerState, memoryState, shouldBranch, branchOffset);
	}

}

// addi rs, rt, imm
// rt = rs + imm
// 0010 00ss ssst tttt iiii iiii iiii iiii
function addi(instructionBinary, action) {

	var rs = parseRs(instructionBinary);
	var rt = parseRt(instructionBinary);
	var imm = parseImm(instructionBinary);

	if(action == "decode") {
		return "ADDI R" + rt + ", R" + rs + ", " + imm;
	}
	else if(action == "execute") {
		var type = "I";

		setRegisterDefault(rs);

		var registerState = { register: rt, value: registers[rs] + imm };
		var memoryState = null;
		var shouldBranch = false;
		var branchOffset = 0;

		return new ExecutionResult(type, registerState, memoryState, shouldBranch, branchOffset);
	}

}

// beq rs, rt, offset
// if(rs == rt) advance pc offset << 2
// 0001 00ss ssst tttt iiii iiii iiii iiii
function branchOnEqual(instructionBinary, action) {

	var rs = parseRs(instructionBinary);
	var rt = parseRt(instructionBinary);
	var offset = parseOffset(instructionBinary);

	if(action == "decode") {
		return "BEQ R" + rs + ", R" + rt + ", " + offset;
	}
	else if(action == "execute") {
		var type = "I";
		var registerState = null;
		var memoryState = null;
		var shouldBranch = false;
		var branchOffset = 0;

		setRegisterDefault(rs);
		setRegisterDefault(rt);

		if(registers[rs] == registers[rt]) {
			shouldBranch = true;
			branchOffset = offset;
		}

		return new ExecutionResult(type, registerState, memoryState, shouldBranch, branchOffset);

	}

}

// bne rs, rt, offset
// if(rs != rt) advance pc offset << 2
// 0001 01ss ssst tttt iiii iiii iiii iiii
function branchNotEqual(instructionBinary, action) {

	var rs = parseRs(instructionBinary);
	var rt = parseRt(instructionBinary);
	var offset = parseOffset(instructionBinary);

	if(action == "decode") {
		return "BNE R" + rs + ", R" + rt + ", " + offset;
	}
	else if(action == "execute") {
		var type = "I";
		var registerState = null;
		var memoryState = null;
		var shouldBranch = false;
		var branchOffset = 0;

		setRegisterDefault(rs);
		setRegisterDefault(rt);

		if(registers[rs] != registers[rt]) {
			shouldBranch = true;
			branchOffset = offset;
		}

		return new ExecutionResult(type, registerState, memoryState, shouldBranch, branchOffset);
	}

}

// lw rt, offset(rs)
// rt = MEM[rs + offset]
// 1000 11ss ssst tttt iiii iiii iiii iiii
function loadWord(instructionBinary, action) {

	var rs = parseRs(instructionBinary);
	var rt = parseRt(instructionBinary);
	var offset = parseOffset(instructionBinary);

	if(action == "decode") {
		return "LW R" + rt + ", " + offset + "(R" + rs + ")";
	}
	else if(action == "execute") {
		var type = "LW";

		setRegisterDefault(rt);
		setRegisterDefault(rs);
		setMemoryDefault(rs + offset);

		var registerState = { register: rt, value: memory[registers[rs] + offset] };
		var memoryState = null;
		var shouldBranch = false;
		var branchOffset = 0;

		return new ExecutionResult(type, registerState, memoryState, shouldBranch, branchOffset);

	}

}

// sw rt, offset(rs)
// MEM[rs + offset] = rt
// 1010 11ss ssst tttt iiii iiii iiii iiii
function storeWord(instructionBinary, action) {

	var rs = parseRs(instructionBinary);
	var rt = parseRt(instructionBinary);
	var offset = parseOffset(instructionBinary);

	if(action == "decode") {
		return "SW R" + rt + ", " + offset + "(R" + rs + ")";
	}
	else if(action == "execute") {
		var type = "SW";

		setRegisterDefault(rt);
		setRegisterDefault(rs);
		setMemoryDefault(rs + offset);

		var registerState = null;
		var memoryState = { memoryLocation: registers[rs] + offset, value: registers[rt] };
		var shouldBranch = false;
		var branchOffset = 0;

		return new ExecutionResult(type, registerState, memoryState, shouldBranch, branchOffset);
	}

}

// slt rd, rs, rt
// if(rs < rt) rd = 1, else rd = 0
// 0000 00ss ssst tttt dddd d000 0010 1010
function setOnLessThan(instructionBinary, action) {

	var rs = parseRs(instructionBinary);
	var rt = parseRt(instructionBinary);
	var rd = parseRd(instructionBinary);

	if(action == "decode") {
		return "SLT R" + rd + ", R" + rs + ", R" + rt;
	}
	else if(action == "execute") {
		var type = "R";

		setRegisterDefault(rs);
		setRegisterDefault(rt);

		var registerState;

		if(registers[rs] < registers[rt]) {
			registerState = { register: rd, value: 1 };
		}
		else {
			registerState = { register: rd, value: 0 };
		}

		var memoryState = null;
		var shouldBranch = false;
		var branchOffset = 0;

		return new ExecutionResult(type, registerState, memoryState, shouldBranch, branchOffset);
	}

}

// sub rd, rs, rt
// rd = rs - rt
// 0000 00ss ssst tttt dddd d000 0010 0010
function sub(instructionBinary, action) {

	var rs = parseRs(instructionBinary);
	var rt = parseRt(instructionBinary);
	var rd = parseRd(instructionBinary);

	if(action == "decode") {
		return "SUB R" + rd + ", R" + rs + ", R" + rt;
	}
	else if(action == "execute") {
		var type = "R";

		setRegisterDefault(rs);
		setRegisterDefault(rt);

		var registerState = { register: rd, value: registers[rs] - registers[rt] };
		var memoryState = null;
		var shouldBranch = false;
		var branchOffset = 0;

		return new ExecutionResult(type, registerState, memoryState, shouldBranch, branchOffset);
	}

}
