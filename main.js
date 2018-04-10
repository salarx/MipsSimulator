var registers = [];
var memorys = [];
var instructions = [];
var warnings = [];

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

 	$("#uploadBox").on("drop", handleFileOnUpload);

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

  	var droppedFile = event.originalEvent.dataTransfer.files[0];
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
  				fileContent = fileContent.toLowerCase();

  				fileContent = decipherRegisters(fileContent);

  				fileContent = decipherMemory(fileContent);

  				fileContent = decipherCode(fileContent);

  				if(!isBlank(fileContent)) {
  					warnings.push("File content still contains text");
  				}

  				setInstructions();
  				console.log(warnings);
  			}
  		};

  		reader.readAsText(droppedFile);
  	}
  	else {
  		alert("Not a text file!");
  	}

  }

/* Take the register section out of the text file
 * Send each register and value to setRegister fxn */
 function decipherRegisters(fileString) {

 	var registerSection = "";
 	var i = 0;

 	if(fileString.includes("registers")) {

 		while(fileString.charAt(i) != 'm') {
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

	for(i = i + 1; i < registerString.length; i++) {
		value += registerString.charAt(i);
	}

	registers.push(String(register).toUpperCase() + ":" + String(value));
}

/* Take the memory section out of the text file
 * Send each memory location and value to setMemory fxn */
 function decipherMemory(fileString) {

 	var memorySection = "";
 	var i = 0;

 	if(fileString.includes("memory")) {

 		while(fileString.charAt(i) != 'c') {
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
	}
	else {
		warnings.push("Memory section not detected");
	}

	return fileString;
}

 /* Sets the initial value of the memory */
  function setMemory(memoryString) {

  	var memory = "";
  	var value = "";
  	var i = 0;

  	while(memoryString.charAt(i) != ' ') {
  		memory += memoryString.charAt(i);
  		i++;
  	}

  	for(i = i + 1; i < memoryString.length; i++) {
  		value += memoryString.charAt(i);
  	}

  	memorys.push(String(memory) + ":" + String(value));
  }

/* Take the code section out of the text file
 * Sends each line of code to readCode fxn */
 function decipherCode(fileString) {

 	var codeSection = fileString;
 	var i = 0;

 	if(fileString.includes("code")) {

		// Remove register section from fileContent
		fileString = fileString.replace(codeSection, "");

		codeSection = codeSection.replace("code", "");

		var codeSectionArray = codeSection.split("\n");

		for(i = 0; i < codeSectionArray.length; i++) {
			
			if(!isBlank(codeSectionArray[i])) {
				readCode(codeSectionArray[i]);
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
function setInstructions() {

	$("#uploadBox").hide();
	$("#instructionBox").css("display", "block");
	$("#simulation-btn-container").css("display", "block");

	$("#instructionBox").append("<center>DECODED INSTRUCTIONS</center><br />");

	$("#instructionBox").append("REGISTERS <br />");
	for(var i = 0; i < registers.length; i++) {
		$("#instructionBox").append(registers[i] + "<br />");
	}

	$("#instructionBox").append("MEMORY <br />");
	for(var i = 0; i < memorys.length; i++) {
		$("#instructionBox").append(memorys[i] + "<br />");
	}

	$("#instructionBox").append("CODE <br />");
	$("#instructionBox").append(instructions);

}

/* Converts unsigned decimal to signed decimal */
function uintToInt(uint, nbit) {
	nbit = +nbit || 32;
	if (nbit > 32) throw new RangeError('uintToInt only supports ints up to 32 bits');
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




