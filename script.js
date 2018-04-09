var registers = {
	"R0": 0,
	"R1": 0,
	"R2": 0,
	"R3": 0,
	"R4": 0,
	"R5": 0,
	"R6": 0,
	"R7": 0,
	"R8": 0,
	"R9": 0,
	"R10": 0,
	"R11": 0,
	"R12": 0,
	"R13": 0,
	"R14": 0,
	"R15": 0,
	"R16": 0,
	"R17": 0,
	"R18": 0,
	"R19": 0,
	"R20": 0,
	"R21": 0,
	"R22": 0,
	"R23": 0,
	"R24": 0,
	"R25": 0,
	"R26": 0,
	"R27": 0,
	"R28": 0,
	"R29": 0,
	"R30": 0,
	"R31": 0
}

var memory = {
	"0": 0,
	"4": 0,
	"8": 0,
	"12": 0,
	"16": 0,
	"20": 0,
	"24": 0,
	"28": 0,
	"32": 0,
	"36": 0,
	"40": 0,
	"44": 0,
	"48": 0,
	"52": 0,
	"56": 0,
	"60": 0,
	"64": 0,
	"68": 0,
	"72": 0,
	"76": 0,
	"80": 0,
	"84": 0,
	"88": 0,
	"92": 0,
	"96": 0,
	"100": 0
}

var instructions = [];

/* Setup the drag and drop functionality
 * Add "file-hover" class when dragover
 * Remove "file-hover" class when not dragover 
 * Go to "displayDroppedFiles" on drop */
$(function() {
	
	$("#uploadBox").on("drag dragstart dragend dragover dragenter dragleave drop", function(event) {
		event.preventDefault();
		event.stopPropagation();
	});

	$("#uploadBox").on("dragenter dragover", function() {
		$("#uploadBox").addClass("file-hover");
	});

	$("#uploadBox").on("dragleave dragend drop", function() {
		$("#uploadBox").removeClass("file-hover")
	});

	$("#uploadBox").on("drop", displayDroppedFiles);

});

/* Confirming that the browser can handle drag & drop
 * Return a bool whether browswer can handle drag & drop
 * If false, then file upload only available on click */ 
function canDoDragAndDrop() {

	var div = document.createElement('div');

	return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 
	'FormData' in window && 'FileReader' in window;
}

/* Display the file that is dropped
 * Wait until "submit" button to perform simulation
 * Look out for files that aren't text files */
function displayDroppedFiles(event) {

	var droppedFile = event.originalEvent.dataTransfer.files[0];
	var fileName = droppedFile.name;
	var fileType = fileName.substr(fileName.length - 3);

	if(fileType == "txt") {
		const reader = new FileReader();

		reader.onload = function(event) {
    		var fileContent = event.target.result;
    		decipher(fileContent);
  		};

		reader.readAsText(droppedFile);
	}
	else {
		alert("Not a text file!");
	}

}

/* Seperate text into blocks "REGISTERS", "MEMORY", and "CODE"
 * Set the initial register values
 * Set the initial memory values
 * Read code binary */
function decipher(fileContent) {
	
	var fileString = fileContent;

	// Registers
	var registerSection = "";
	var i = 0;

	while(fileString.charAt(i) != 'M') {
		registerSection = registerSection + fileString.charAt(i);
		i++;
	}

	registerSection = registerSection.replace("REGISTERS", "");

	var registerArray = registerSection.split("\n");
	//console.log(registerArray);

	for(var j = 0; j < registerArray.length; j++) {
		setRegisters(registerArray[j]);
	}
	//console.log(registers);
	// End Registers

	// Memory
	var memorySection = "";

	while(fileString.charAt(i) != 'C') {
		memorySection = memorySection + fileString.charAt(i);
		i++;
	}

	memorySection = memorySection.replace("MEMORY", "");

	var memoryArray = memorySection.split("\n");
	//console.log(memoryArray);

	for(var j = 0; j < memoryArray.length; j++) {
		setMemory(memoryArray[j]);
	}
	//console.log(memory);
	// End Memory

	// Code
	var codeSection = "";
	for(i = i; i < fileString.length; i++) {
		codeSection = codeSection + fileString.charAt(i);
	}

	codeSection = codeSection.replace("CODE", "");

	var codeArray = codeSection.split("\n");
	//console.log(codeArray);

	for(var j = 0; j < codeArray.length; j++) {
		readCode(codeArray[j]);
	}
	// End Code

	$("#uploadBox").hide();
	$("#instructionBox").css("display", "block");
	$("#simulation-btn-container").css("display", "block");

	$("#instructionBox").append("<center>DECODED INSTRUCTIONS</center><br />");

	$("#instructionBox").append("REGISTERS <br />");
	for(var x = 0; x < 32; x++) {
		if(registers["R" + x] != 0) {
			$("#instructionBox").append("R" + x + ": ");
			$("#instructionBox").append(registers["R" + x]);
			$("#instructionBox").append("<br />");
		}
	}

	$("#instructionBox").append("<br /> MEMORY <br />");
	for(var x = 0; x < 25; x++) {
		if(memory[String(x * 4)] != 0) {
			$("#instructionBox").append((x * 4) + " " + memory[String(x * 4)]);
			$("#instructionBox").append("<br />");
		}
	}

	$("#instructionBox").append("<br /> CODE <br />");
	$("#instructionBox").append(instructions);
}

/* Sets the initial value of the registers
 * Registers R0 - R31 */
function setRegisters(registerString) {

	if(isBlank(registerString)) {
		return;
	}

	var i = 0;
	var register = "";
	var value = "";

	while(registerString.charAt(i) != ' ') {
		register = register + registerString.charAt(i);
		i++;
	}

	for(i = i + 1; i < registerString.length; i++) {
		value = value + registerString.charAt(i);
	}

	registers[register] = value;

}

/* Sets the initial values of the memory
 * Memory locations 0 - 100 increments of 4 */
function setMemory(memoryString) {

	if(isBlank(memoryString)) {
		return;
	}

	var i = 0;
	var memoryLocation = "";
	var value = "";

	while(memoryString.charAt(i) != ' ') {
		memoryLocation = memoryLocation + memoryString.charAt(i);
		i++;
	}

	for(i = i + 1; i < memoryString.length; i++) {
		value = value + memoryString.charAt(i);
	}

	memory[memoryLocation] = value;

}

/* Read the opcode first
 * Switch statement to decide how to handle instruction */
function readCode(codeString) {

	var opcode = "";
	var funct = "";
	var i = 0;

	for(i = 0; i < 6; i++) {
		opcode = opcode + codeString.charAt(i);
	}

	switch(opcode) {
		// Add, subtract, set less than
		case "000000":
			for(i = codeString.length - 6; i < codeString.length; i++) {
				funct = funct + codeString.charAt(i);
			}
			if(funct == "100000") {
				add(codeString);
			}
			else if(funct == "100010") {
				sub(codeString);
			}
			else if(funct == "101010") {
				setLessThan(codeString);
			}
			break;
		// Add immediate
		case "001000":
			addi(codeString);
			break;
		// Branch on equal
		case "000100":
			branchIfEqual(codeString);
			break;
		// Branch on not equal
		case "000101":
			branchNotEqual(codeString);
			break;
		// Load word
		case "100011":
			loadWord(codeString);
			break;
		// Store word
		case "101011":
			storeWord(codeString);
			break;
		default:
			break;
	}
	
}

// MIPS INSTRUCTIONS

/* lw rt, offset(rs)
 * 1000 11ss ssst tttt iiii iiii iiii iiii*/
function loadWord(codeString) {
	
	var i = 0;
	var rs = "";
	var rt = "";
	var offset = "";

	for(i = 6; i < 11; i++) {
		rs = rs + codeString.charAt(i);
	}

	rs = parseInt(rs, 2);

	for(i = 11; i < 16; i++) {
		rt = rt + codeString.charAt(i);
	}

	rt = parseInt(rt, 2);

	for(i = 16; i < codeString.length; i++) {
		offset = offset + codeString.charAt(i);
	}

	offset = parseInt(offset, 2);

	instructions.push("LW R" + rt + ", " + offset + "(R" + rs + ") <br />");
}

/* sw rt, offset(rs)
 * 1010 11ss ssst tttt iiii iiii iiii iiii*/
function storeWord(codeString) {
	
	var i = 0;
	var rs = "";
	var rt = "";
	var offset = "";

	for(i = 6; i < 11; i ++) {
		rs = rs + codeString.charAt(i);
	}

	rs = parseInt(rs, 2);

	for(i = 11; i < 16; i++) {
		rt = rt + codeString.charAt(i);
	}

	rt = parseInt(rt, 2);

	for(i = 16; i < codeString.length; i++) {
		offset = offset + codeString.charAt(i);
	}

	offset = parseInt(offset, 2);

	instructions.push("SW R" + rt + ", " + offset + "(R" + rs + ") <br />");
}

/* add rd, rs, rt
 * rd = rs + rt
 * 0000 00ss ssst tttt dddd d000 0010 0000*/
function add(codeString) {

	var i = 0;
	var rs = "";
	var rt = "";
	var rd = "";

	for(i = 6; i < 11; i++) {
		rs = rs + codeString.charAt(i);
	}

	rs = parseInt(rs, 2);

	for(i = 11; i < 16; i++) {
		rt = rt + codeString.charAt(i);
	}

	rt = parseInt(rt, 2);

	for(i = 16; i < 21; i++) {
		rd = rd + codeString.charAt(i);
	}

	rd = parseInt(rd, 2);

	instructions.push("ADD R" + rd + ", R" + rs + ", R" + rt + "<br />");
}

/* addi rs, rt, imm
 * rt = rs + imm
 * 0010 00ss ssst tttt iiii iiii iiii iiii*/
function addi(codeString) {
	
	var i = 0;
	var rs = "";
	var rt = "";
	var imm = "";

	for(i = 6; i < 11; i++) {
		rs = rs + codeString.charAt(i);
	}

	rs = parseInt(rs, 2);

	for(i = 11; i < 16; i++) {
		rt = rt + codeString.charAt(i);
	}

	rt = parseInt(rt, 2);

	for(i = 16; i < codeString.length; i++) {
		imm = imm + codeString.charAt(i);
	}

	imm = parseInt(imm, 2);
	imm = uintToInt(imm, 10);

	instructions.push("ADDI R" + rt + ", R" + rs + ", " + imm + "<br />");
}

/* sub rd, rs, rt
 * rd = rs - rt
 * 0000 00ss ssst tttt dddd d000 0010 0010*/
function sub(codeString) {
	
	var i = 0;
	var rs = "";
	var rt = ""; 
	var rd = "";

	for(i = 6; i < 11; i++) {
		rs = rs + codeString.charAt(i);
	}

	rs = parseInt(rs, 2);

	for(i = 11; i < 16; i++) {
		rt = rt + codeString.charAt(i);
	}

	rt = parseInt(rt, 2);

	for(i = 16; i < codeString.length; i++) {
		rd = rd + codeString.charAt(i);
	}

	rd = parseInt(rd, 2);

	instructions.push("SUB R" + rd + ", R" + rs + ", R" + rt + "<br />")
}

/* TODO */
function subi(codeString) {
	console.log("subtract immediate");
}

function setLessThan(codeString) {
	console.log("SetLessThan");
}

/* beq rs, rt, offset
 * if(rs == rt) pc += offset * 4*/
function branchIfEqual(codeString) {
	
	var i = 0;
	var rs = "";
	var rt = "";
	var offset = "";

	for(i = 6; i < 11; i++) {
		rs = rs + codeString.charAt(i);
	}

	rs = parseInt(rs, 2);

	for(i = 11; i < 16; i++) {
		rt = rt + codeString.charAt(i);
	}

	rt = parseInt(rt, 2);

	for(i = 16; i < codeString.length; i++) {
		offset = offset + codeString.charAt(i);
	}

	offset = parseInt(offset, 2);

	instructions.push("BEQ R" + rs + ", " + rt + ", " + offset + "<br />");
}

/* bne rs, rt, offset
 * if(rs != rt) pc += offset * 4*/
function branchNotEqual(codeString) {
	
	var i = 0;
	var rs = "";
	var rt = "";
	var offset = "";

	for(i = 6; i < 11; i++) {
		rs = rs + codeString.charAt(i);
	}

	rs = parseInt(rs, 2);

	for(i = 11; i < 16; i++) {
		rt = rt + codeString.charAt(i);
	}

	rt = parseInt(rt, 2);

	for(i = 16; i < codeString.length; i++) {
		offset = offset + codeString.charAt(i);
	}

	offset = parseInt(offset, 2);

	instructions.push("BNE R" + rs + ", " + rt + ", " + offset + "<br />");
}

// END MIPS INSTRUCTIONS

// EXTENSIONS

function uintToInt(uint, nbit) {
    nbit = +nbit || 32;
    if (nbit > 32) throw new RangeError('uintToInt only supports ints up to 32 bits');
    uint <<= 32 - nbit;
    uint >>= 32 - nbit;
    return uint;
}

// Checking any type has value
function isEmpty(str) {
    return (!str || 0 === str.length);
}

// Checking string has value and isn't empty
function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

// END EXTENSIONS



