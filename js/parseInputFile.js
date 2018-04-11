var registers = {};
var memory = {};
var instructions = [];
var warnings = [];

/* Setup the drag and drop functionality
 * Add "file-hover" class when dragover
 * Remove "file-hover" class when not dragover 
 * Go to "handleFileOnUpload" on drop */
 $(function() {

 	if(!canDoDragAndDrop) {
 		$("#dragDropAvailable").hide();
 	}

 	$("#uploadContainer").on("drag dragstart dragend dragover dragenter dragleave drop", function(event) {
 		event.preventDefault();
 		event.stopPropagation();
 	});

 	$("#uploadContainer").on("dragenter dragover", function() {
 		$("#uploadContainer").addClass("file-hover");
 	});

 	$("#uploadContainer").on("dragleave dragend drop", function() {
 		$("#uploadContainer").removeClass("file-hover")
 	});

 	$("#uploadContainer").on("drop", handleFileOnUpload);

	$('input[type="file"]').change(handleFileOnUpload);

 });

/* Confirming that the browser can handle drag & drop
 * Return a bool whether browswer can handle drag & drop
 * If false, then file upload only available on click */ 
 function canDoDragAndDrop() {

 	var div = document.createElement('div');

 	return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 
 	'FormData' in window && 'FileReader' in window;
 }

 /* Check that the file is of type ".txt"
  * If so, convert binary to text, else 
  * alert user that file is not .txt */
  function handleFileOnUpload(event) {

  	var droppedFile;

  	if(event.type == "drop") {
  		droppedFile = event.originalEvent.dataTransfer.files[0];
  	}
  	else if(event.type == "change") {
  		droppedFile = $("#file")[0].files[0];
  	}

  	var fileName = droppedFile.name;
  	var fileType = fileName.substr(fileName.length - 3);

  	if(fileType == "txt") {
  		const reader = new FileReader();

  		reader.onload = function(event) {
  			var fileContent = event.target.result;

  			if(isBlank(fileContent)) {
  				alert("File is empty!");
  			}
  			else {

  				resetProgram();

  				fileContent = fileContent.toLowerCase();
  				fileContent = decipherRegisters(fileContent);
  				fileContent = decipherMemory(fileContent);
  				fileContent = decipherCode(fileContent);

  				displayDecodedInputFile();

  				console.log(warnings);
  			}
  		};

  		reader.readAsText(droppedFile);
  	}
  	else {
  		alert("Incorrect file type!");
  	}

  }

  /* Clear program when a file is uploaded */
  function resetProgram() {

  	$("#instructionBox").html("");
  	$("#simulationBox").html("");
  	$("#simulationBox").hide();
  	registers = {};
  	memory = {};
  	instructions = [];
  	warnings = [];
  	registerStates = [];
  	memoryStates = [];
	instructionCache = [];
	pcCounter = 0;
	cycleCount = 0;

  }

/* Take the register section out of the text file
* Send each register and value to setRegister fxn */
function decipherRegisters(fileString) {

	var registerSection = "";
	var i = 0;

	if(fileString.includes("registers")) {

		while(fileString.charAt(i) != 'm' && fileString.charAt(i) != 'c' && i < fileString.length) {
			registerSection += fileString.charAt(i);
			i++;
		}

		// Remove register section from fileContent
		fileString = fileString.replace(registerSection, "");

		registerSection = registerSection.replace("registers", "");

		var registerSectionArray = registerSection.split("\n");

		for(i = 0; i < registerSectionArray.length; i++) {
			
			if(!isBlank(registerSectionArray[i])) {
				setRegisters(registerSectionArray[i]);
			}
		}

		registerStates.push(cloneRegisters());
	}
	else {
		warnings.push("Register section not detected.");
	}

	return fileString;
}

/* Sets the initial value of the registers
* Registers R0 - R31 */
function setRegisters(registerString) {

	var register = "";
	var value = "";
	var i = 0;

	while(registerString.charAt(i) != ' ') {
		register += registerString.charAt(i);
		i++;
	}

	register = register.replace("r", "");

	if(isValidRegister(register)) {

		for(i = i + 1; i < registerString.length; i++) {
			value += registerString.charAt(i);
		}

		if(isValidValue(value)) {

			value = parseInt(value, 10);

			registers[register] = value;

		}
		else {
			warnings.push("Register value '" + value + "' could not be parsed");
		}

	}
	else {
		warnings.push("Not a valid register: " + register);
	}

}

/* Check that the register number is a valid register
* Register number must be a number between 0 and 31 */
function isValidRegister(register) {

	var registerNumber;
	var isValid = false;
	var isNumPattern = /^\d+$/;

	if(isNumPattern.test(register)) {
		
		registerNumber = parseInt(register, 10);

		if(registerNumber || registerNumber == 0) {

			if(registerNumber >= 0 && registerNumber < 32) {

				isValid = true;
			}
		}
	}

	return isValid;
}

/* Take the memory section out of the text file
* Send each memory location and value to setMemory fxn */
function decipherMemory(fileString) {

	var memorySection = "";
	var i = 0;

	if(fileString.includes("memory")) {

		while(fileString.charAt(i) != 'c' && i < fileString.length) {
			memorySection += fileString.charAt(i);
			i++;
		}

		// Remove memory section from fileContent
		fileString = fileString.replace(memorySection, "");

		memorySection = memorySection.replace("memory", "");

		var memorySectionArray = memorySection.split("\n");

		for(i = 0; i < memorySectionArray.length; i++) {
			
			if(!isBlank(memorySectionArray[i])) {
				setMemory(memorySectionArray[i]);
			}
		}

		memoryStates.push(cloneMemory());
	}
	else {
		warnings.push("Memory section not detected");
	}

	return fileString;
}

/* Sets the initial value of the memory */
function setMemory(memoryString) {

	var memoryLocation = "";
	var value = "";
	var i = 0;

	while(memoryString.charAt(i) != ' ') {
		memoryLocation += memoryString.charAt(i);
		i++;
	}

	memoryLocation = memoryLocation.replace("m", "");

	if(isValidMemoryLocation(memoryLocation)) {

		for(i = i + 1; i < memoryString.length; i++) {
			value += memoryString.charAt(i);
		}

		if(isValidValue(value)) {

			value = parseInt(value, 10);

			memory[memoryLocation] = value;
		}
		else {
			warnings.push("Memory value '" + value + "' could not be parsed");
		}
		
	}
	else {
		warnings.push("Not a valid memory location");
	}

}

/* Check that the memory number is a valid memory location
 * Memory number must be a number greater than 0 and 
 * divisible by 4 */
 function isValidMemoryLocation(memoryLocation) {

 	var memoryNumber;
 	var isValid = false;
 	var isNumPattern = /^\d+$/;

 	if(isNumPattern.test(memoryLocation)) {

 		memoryNumber = parseInt(memoryLocation, 10);

 		if(memoryNumber || memoryNumber == 0) {

 			if(memoryNumber >= 0 && memoryNumber % 4 == 0) {

 				isValid = true;
 			}
 		}	
 	}

 	return isValid;
 }

/* Check that a value is a valid MIPS value.
 * The value must be a number, less than 4294967295 
 * (MAX 32 bit unsigned integer), and greater than 
 * -2147483648 (MIN 32 bit signed integer) */
 function isValidValue(value) {

 	var isValid = false;
 	var isNumPattern = /^\d+$/;

 	if(isNumPattern.test(value)) {

 		value = parseInt(value, 10);

 		if(value || value == 0) {

 			if(value <= 4294967295 && value >= -2147483648) {

 				isValid = true;
 			}
 		}
 	}

 	return isValid;
 }

/* Take the code section out of the text file
* Sends each line of code to readCode fxn */
function decipherCode(fileString) {

	var codeSection = fileString;
	var i = 0;

	if(fileString.includes("code")) {

		// Remove code section from fileContent
		fileString = fileString.replace(codeSection, "");

		codeSection = codeSection.replace("code", "");

		var codeSectionArray = codeSection.split("\n");

		for(i = 0; i < codeSectionArray.length; i++) {
			
			if(!isBlank(codeSectionArray[i])) {

				if(codeSectionArray[i].length == 32) {
					readCode(codeSectionArray[i]);
				}	
				else {
					warnings.push("Code '" + codeSectionArray[i] + "' is not 32 bit");
				}
			}
		}
	}
	else {
		warnings.push("Code section not detected");
	}

	return fileString;
}

/* Takes a 32 bit binary MIPS instruction and reads
* opcode and funct code to determine which instruction */
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
		warnings.push(opcode + ": Opcode not found");
		break;
	}

}

/* Displays the instruction set to user */
function displayDecodedInputFile() {

	$("#instructionBox").css("display", "block");
	$("#controlPanel").css("display", "block");

	$("#instructionBox").append("<center>DECODED INSTRUCTIONS</center><br />");
	
	$("#instructionBox").append("REGISTERS <br />");
	if(registerStates[0]) {
		for(var key in registerStates[0]) {
			$("#instructionBox").append("R" + key + " " + registerStates[0][key] + "<br />");
		}
	}
	else {
		$("#instructionBox").append("Registers all set to 0 <br />");
	}

	$("#instructionBox").append("<br />");

	$("#instructionBox").append("MEMORY <br />");
	if(memoryStates[0]) {
		for(var key in memoryStates[0]) {
			$("#instructionBox").append(key + " " + memoryStates[0][key] + "<br />");
		}
	} 
	else {
		$("#instructionBox").append("Memory locations all set to 0 <br />");
	}

	$("#instructionBox").append("<br />");

	$("#instructionBox").append("CODE <br />");
	if(instructions.length != 0) {
		$("#instructionBox").append(instructions);
	}
	else {
		$("#instructionBox").append("No instructions entered");
	}

	$('html, body').animate({
		scrollTop: $("#instructionBox").offset().top
	}, 500);

}

/* Return a copy of the registers */
function cloneRegisters() {

	var clone = {};

	for(var key in registers) {
		clone[key] = registers[key];
	}

	return clone;
}

/* Return a copy of the memory */
function cloneMemory() {

	var clone = {};

	for(var key in memory) {
		clone[key] = memory[key];
	}

	return clone;
}

/* Converts unsigned decimal to signed decimal */
function uintToInt(uint, nbit) {

	nbit = +nbit || 32;

	if (nbit > 32) {
		throw new RangeError('uintToInt only supports ints up to 32 bits');
	}

	uint <<= 32 - nbit;
	uint >>= 32 - nbit;

	return uint;
}

/* Checking any type has value */
function isEmpty(str) {
	return (!str || 0 === str.length);
}

/* Checking string has value and isn't empty */
function isBlank(str) {
	return (!str || /^\s*$/.test(str));
}



