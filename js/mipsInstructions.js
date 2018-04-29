const ACTIONS = {
	DECODE: "decode",
	EXECUTE: "execute",
	SHOULD_STALL: "stall"
}

// ExecutionResult object returned by MIPS instruction on execute action.
// Params:
//	String for type of instruction executed
//	Register number and value object affected if applicable
//	Memory location and value object affected if applicable
//	Bool if the instruction causes a branch
//	Integer of branch offset if shouldBranch = true
function ExecutionResult(stallLocation, stallAmount, registerState, memoryState, shouldBranch, branchOffset) {

	this.stallLocation = stallLocation;
	this.stallAmount = stallAmount;
	this.registerState = registerState;
	this.memoryState = memoryState;
	this.shouldBranch = shouldBranch;
	this.branchOffset = branchOffset;

}

// Decodes binary instruction and runs corresponding function
// with specific action.
// Params:
//	String of 32-bit binary instruction
//	Action specifying what to do with instruction
// Return:
//	Result of calling the instruction with action
function findInstruction(binaryInstructionString, action) {

	binaryInstructionString = binaryInstructionString.trim();
	var opcode = binaryInstructionString.substring(0, 6);
	var result;

	switch(opcode) {
		// For opcodes with 000000, we need to read function code
		case "000000":
		var funct = binaryInstructionString.substring(26);
		if(funct == "100000") {
			result = add(binaryInstructionString, action);
		}
		else if(funct == "100010") {
			result = sub(binaryInstructionString, action);
		}
		else if(funct == "101010") {
			result = setOnLessThan(binaryInstructionString, action);
		}
		break;
		case "001000":
		result = addi(binaryInstructionString, action);
		break;
		case "000100":
		result = branchOnEqual(binaryInstructionString, action);
		break;
		case "000101":
		result = branchNotEqual(binaryInstructionString, action);
		break;
		case "100011":
		result = loadWord(binaryInstructionString, action);
		break;
		case "101011":
		result = storeWord(binaryInstructionString, action);
		break;
		default:
		break;
	}

	return result;

}

// Read rs section of binary MIPS instruction which
// is indices between 6 and 11.
// Params:
//	String of 32-bit binary instruction
// Return:
//	Integer value of rs
function parseRs(binaryInstructionString) {

	var rs = binaryInstructionString.substring(6, 11);

	return parseInt(rs, 2);

}

// Read rt section of binary MIPS instruction which
// is indices between 11 and 16.
// Params:
//	String of 32-bit binary instruction
// Return:
//	Integer value of rt
function parseRt(binaryInstructionString) {

	var rt = binaryInstructionString.substring(11, 16);

	return parseInt(rt, 2);

}

// Read rd section of binary MIPS instruction which
// is indices between 16 and 21.
// Params:
//	String of 32-bit binary instruction
// Return:
//	Integer value of rd
function parseRd(binaryInstructionString) {

	var rd = binaryInstructionString.substring(16, 21);

	return parseInt(rd, 2);

}

// Read offset section of binary MIPS instruction which
// is indices between 16 and 32.
// Params:
//	String of 32-bit binary instruction
// Return:
//	Integer value of offset
function parseOffset(binaryInstructionString) {

	var offset = binaryInstructionString.substring(16);

	return parseInt(offset, 2);

}

// Read immediate section of binary MIPS instruction which
// is indices between 16 and 32. Check whether the value is
// negative and convert appropriately.
// Params:
//	String of 32-bit binary instruction
// Return:
//	Integer value of immediate
function parseImm(binaryInstructionString) {

	var imm = binaryInstructionString.substring(16);

	// Check immediate is negative
	imm = parseInt(imm, 2);
	imm = uintToInt(imm, 10);

	return imm;

}

// If register doesn't exist but used in calculation, create it
// and set it to 0. Check for validity not needed.
// Params:
//	Integer of register to check
// Return:
//	None
function setRegisterDefault(registerNumber) {

	if(!registers[registerNumber]) {
		registers[registerNumber] = 0;
	}

}

// If memory location doesn't exist but used in calculation,
// create it and set it to 0. Check for validity not needed.
// Params:
//	Integer of memory location to check
// Return:
//	None
function setMemoryDefault(memoryLocation) {

	if(!memory[memoryLocation]) {
		memory[memoryLocation] = 0;
	}

}

// MIPS INSTRUCTIONS
// Params:
//	String of 32-bit binary instruction
//	Action specifying what to do with instruction
// Return:
//	Result based on action

// add rd, rs, rt
// rd = rs + rt
// 0000 00ss ssst tttt dddd d000 0010 0000
function add(binaryInstructionString, action) {

	var rs = parseRs(binaryInstructionString);
	var rt = parseRt(binaryInstructionString);
	var rd = parseRd(binaryInstructionString);

	if(action == ACTIONS.DECODE) {
		return "ADD R" + rd + ", R" + rs + ", R" + rt;
	}
	else if(action == ACTIONS.EXECUTE) {
		setRegisterDefault(rs);
		setRegisterDefault(rt);

		var stallLocation = rd;
		var stallAmount = 2;
		var registerState = { register: rd, value: registers[rs] + registers[rt] };
		var memoryState = null;
		var shouldBranch = false;
		var branchOffset = 0;

		return new ExecutionResult(stallLocation, stallAmount, registerState, memoryState, shouldBranch, branchOffset);
	}
	else if(action == ACTIONS.SHOULD_STALL) {
		return [rs, rt];
	}

}

// addi rs, rt, imm
// rt = rs + imm
// 0010 00ss ssst tttt iiii iiii iiii iiii
function addi(binaryInstructionString, action) {

	var rs = parseRs(binaryInstructionString);
	var rt = parseRt(binaryInstructionString);
	var imm = parseImm(binaryInstructionString);

	if(action == ACTIONS.DECODE) {
		return "ADDI R" + rt + ", R" + rs + ", " + imm;
	}
	else if(action == ACTIONS.EXECUTE) {
		setRegisterDefault(rs);

		var stallLocation = rt;
		var stallAmount = 2;
		var registerState = { register: rt, value: registers[rs] + imm };
		var memoryState = null;
		var shouldBranch = false;
		var branchOffset = 0;

		return new ExecutionResult(stallLocation, stallAmount, registerState, memoryState, shouldBranch, branchOffset);
	}
	else if(action == ACTIONS.SHOULD_STALL) {
		return [rs];
	}

}

// beq rs, rt, offset
// if(rs == rt) advance pc offset << 2
// 0001 00ss ssst tttt iiii iiii iiii iiii
function branchOnEqual(binaryInstructionString, action) {

	var rs = parseRs(binaryInstructionString);
	var rt = parseRt(binaryInstructionString);
	var offset = parseOffset(binaryInstructionString);

	if(action == ACTIONS.DECODE) {
		return "BEQ R" + rs + ", R" + rt + ", " + offset;
	}
	else if(action == ACTIONS.EXECUTE) {
		setRegisterDefault(rs);
		setRegisterDefault(rt);

		var stallAmount = 0;
		var registerState = null;
		var memoryState = null;
		var shouldBranch = false;
		var branchOffset = 0;

		if(registers[rs] == registers[rt]) {
			shouldBranch = true;
			branchOffset = offset;
		}

		return new ExecutionResult(null, stallAmount, registerState, memoryState, shouldBranch, branchOffset);
	}
	else if(action == ACTIONS.SHOULD_STALL) {
		return [rs, rt];
	}

}

// bne rs, rt, offset
// if(rs != rt) advance pc offset << 2
// 0001 01ss ssst tttt iiii iiii iiii iiii
function branchNotEqual(binaryInstructionString, action) {

	var rs = parseRs(binaryInstructionString);
	var rt = parseRt(binaryInstructionString);
	var offset = parseOffset(binaryInstructionString);

	if(action == ACTIONS.DECODE) {
		return "BNE R" + rs + ", R" + rt + ", " + offset;
	}
	else if(action == ACTIONS.EXECUTE) {
		setRegisterDefault(rs);
		setRegisterDefault(rt);

		var stallAmount = 0;
		var registerState = null;
		var memoryState = null;
		var shouldBranch = false;
		var branchOffset = 0;

		if(registers[rs] != registers[rt]) {
			shouldBranch = true;
			branchOffset = offset;
		}

		return new ExecutionResult(null, stallAmount, registerState, memoryState, shouldBranch, branchOffset);
	}
	else if(action == ACTIONS.SHOULD_STALL) {
		return [rs, rt];
	}

}

// lw rt, offset(rs)
// rt = MEM[rs + offset]
// 1000 11ss ssst tttt iiii iiii iiii iiii
function loadWord(binaryInstructionString, action) {

	var rs = parseRs(binaryInstructionString);
	var rt = parseRt(binaryInstructionString);
	var offset = parseOffset(binaryInstructionString);

	if(action == ACTIONS.DECODE) {
		return "LW R" + rt + ", " + offset + "(R" + rs + ")";
	}
	else if(action == ACTIONS.EXECUTE) {
		setRegisterDefault(rt);
		setRegisterDefault(rs);
		setMemoryDefault(rs + offset);

		var stallLocation = rt;
		var stallAmount = 2;
		var registerState = { register: rt, value: memory[registers[rs] + offset] };
		var memoryState = null;
		var shouldBranch = false;
		var branchOffset = 0;

		return new ExecutionResult(stallLocation, stallAmount, registerState, memoryState, shouldBranch, branchOffset);
	}
	else if(action == ACTIONS.SHOULD_STALL) {
		return [rs];
	}

}

// sw rt, offset(rs)
// MEM[rs + offset] = rt
// 1010 11ss ssst tttt iiii iiii iiii iiii
function storeWord(binaryInstructionString, action) {

	var rs = parseRs(binaryInstructionString);
	var rt = parseRt(binaryInstructionString);
	var offset = parseOffset(binaryInstructionString);

	if(action == ACTIONS.DECODE) {
		return "SW R" + rt + ", " + offset + "(R" + rs + ")";
	}
	else if(action == ACTIONS.EXECUTE) {
		setRegisterDefault(rt);
		setRegisterDefault(rs);
		setMemoryDefault(rs + offset);

		var stallAmount = 0;
		var registerState = null;
		var memoryState = { memoryLocation: registers[rs] + offset, value: registers[rt] };
		var shouldBranch = false;
		var branchOffset = 0;

		return new ExecutionResult(null, stallAmount, registerState, memoryState, shouldBranch, branchOffset);
	}
	else if(action == ACTIONS.SHOULD_STALL) {
		return [rs, rt];
	}

}

// slt rd, rs, rt
// if(rs < rt) rd = 1, else rd = 0
// 0000 00ss ssst tttt dddd d000 0010 1010
function setOnLessThan(binaryInstructionString, action) {

	var rs = parseRs(binaryInstructionString);
	var rt = parseRt(binaryInstructionString);
	var rd = parseRd(binaryInstructionString);

	if(action == ACTIONS.DECODE) {
		return "SLT R" + rd + ", R" + rs + ", R" + rt;
	}
	else if(action == ACTIONS.EXECUTE) {
		setRegisterDefault(rs);
		setRegisterDefault(rt);

		var stallAmount = 2;
		var registerState;

		if(registers[rs] < registers[rt]) {
			registerState = { register: rd, value: 1 };
		}
		else {
			registerState = { register: rd, value: 0 };
		}

		var stallLocation = rd;
		var stallAmount = 2;
		var memoryState = null;
		var shouldBranch = false;
		var branchOffset = 0;

		return new ExecutionResult(stallLocation, stallAmount, registerState, memoryState, shouldBranch, branchOffset);
	}
	else if(action == ACTIONS.SHOULD_STALL) {
		return [rs, rt];
	}

}

// sub rd, rs, rt
// rd = rs - rt
// 0000 00ss ssst tttt dddd d000 0010 0010
function sub(binaryInstructionString, action) {

	var rs = parseRs(binaryInstructionString);
	var rt = parseRt(binaryInstructionString);
	var rd = parseRd(binaryInstructionString);

	if(action == ACTIONS.DECODE) {
		return "SUB R" + rd + ", R" + rs + ", R" + rt;
	}
	else if(action == ACTIONS.EXECUTE) {
		setRegisterDefault(rs);
		setRegisterDefault(rt);

		var stallLocation = rd;
		var stallAmount = 2;
		var registerState = { register: rd, value: registers[rs] - registers[rt] };
		var memoryState = null;
		var shouldBranch = false;
		var branchOffset = 0;

		return new ExecutionResult(stallLocation, stallAmount, registerState, memoryState, shouldBranch, branchOffset);
	}
	else if(action == ACTIONS.SHOULD_STALL) {
		return [rs, rt];
	}

}
