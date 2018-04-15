
var instructions;
var registerStates;
var memoryStates;
var cycleData;

var currentStep = 0;

var pcCounter = 0;
var cycleCount = 1;

const EXECUTE = "execute";

function stepThrough() {

	simulate();

	$("#simulationResultsContainer").show();
	displayInstructions(0);
	displayRegisters(0);
	displayMemory(0);

	$('html, body').animate({
		scrollTop: $("#simulationResultsContainer").offset().top - 20
	}, 500);

}

function nextStep() {

	displayInstructions(currentStep + 1);
	displayRegisters(currentStep + 1);
	displayMemory(currentStep + 1);

}

function previousStep() {

	displayInstructions(currentStep - 1);
	displayRegisters(currentStep - 1);
	displayMemory(currentStep - 1);

}

function executeAll() {

	simulate();

	$("#simulationResultsContainer").show();
	displayInstructions(instructions.length - 1);
	displayRegisters(registerStates.length - 1);
	displayMemory(memoryStates.length - 1);
	displayCycleData();

	$('html, body').animate({
		scrollTop: $("#simulationResultsContainer").offset().top - 20
	}, 500);

}

function displayInstructions(currentInstruction) {

	for(var i = 0; i < instructions.length; i++) {
		if(i == currentInstruction) {
			$("#simulationInstructions").append("<tr><td>&rarr;</td><td>" + decodedCode[i] + "</td></tr>");
		}
		else {
			$("#simulationInstructions").append("<tr><td></td><td>" + decodedCode[i] + "</td></tr>");
		}
	}

}

function displayRegisters(currentRegisterState) {

	for(var key in registerStates[currentRegisterState]) {
		if(registerStates[currentRegisterState][key]) {
			$("#simulationRegisters").append("<tr><td>R" + key + "</td><td>" + registerStates[currentRegisterState][key] + "</td></tr>");
		}
	}
}

function displayMemory(currentMemoryState) {

	for(var key in memoryStates[currentMemoryState]) {
		if(memoryStates[currentMemoryState][key]){
			$("#simulationMemory").append("<tr><td>" + key + "</td><td>" + memoryStates[currentMemoryState][key] + "</td></tr>");
		}
	}

}

function displayCycleData(currentCycleData) {

	$("#clockCycleTitle").attr("colspan", cycleData.length);

	for(var i = 1; i <= cycleCount; i++) {
		$("#simulationCycleNumber").append("<td>" + i + "</td>");
	}
console.log(cycleData);
	for(var i = 0; i < cycleData.length; i++) {
		$("#simulationCycleData").append(cycleData[i]);
	}

}

function simulate() {

	registerStates.push(Object.assign({}, registers));
	memoryStates.push(Object.assign({}, memory));

	var isFinished = false;

	while(pcCounter < instructions.length) {

		cycleData.push("<tr>");
		if(cycleCount != 0) {
			cycleData.push("<td colspan=" + cycleCount + "></td>");
		}

		var instruction = instructionFetch();

		var executionResult = decodeAndExecute(instruction);

		if(executionResult.shouldBranch) {
			pcCounter += executionResult.branchOffset;
		}

		if(executionResult.type == "LW" || executionResult.type == "SW") {
			writeMemory(executionResult);
		}

		if(executionResult.type == "LW" || executionResult.type == "R") {
			writeBack(executionResult);
		}

		cycleData.push("</tr>");
		pcCounter++;

	}

}

function instructionFetch() {

	cycleData.push("<td>I" + (pcCounter + 1) + " - IF</td>");
	cycleCount++;

	return instructions[pcCounter];
}

function decodeAndExecute(instructionBinary) {

	var opcode = "";
	var funct = "";
	var executionResult;

	cycleData.push("<td>I" + (pcCounter + 1) + " - ID</td>");
	cycleCount++;

	for(var j = 0; j < 6; j++) {
		opcode += instructionBinary.charAt(j);
	}

	switch(opcode) {
		case "000000":
		for(var j = instructionBinary.length - 6; j < instructionBinary.length; j++) {
			funct += instructionBinary.charAt(j);
		}
		if(funct == "100000") {
			executionResult = add(instructionBinary, EXECUTE);
		}
		else if(funct == "100010") {
			executionResult = sub(instructionBinary, EXECUTE);
		}
		else if(funct == "101010") {
			executionResult = setOnLessThan(instructionBinary, EXECUTE);
		}
		break;
		case "001000":
		executionResult = addi(instructionBinary, EXECUTE);
		break;
		case "000100":
		executionResult = branchOnEqual(instructionBinary, EXECUTE);
		break;
		case "000101":
		executionResult = branchNotEqual(instructionBinary, EXECUTE);
		break;
		case "100011":
		executionResult = loadWord(instructionBinary, EXECUTE);
		break;
		case "101011":
		executionResult = storeWord(instructionBinary, EXECUTE);
		break;
		default:
		break;
	}

	cycleData.push("<td>I" + (pcCounter + 1) + " - EX</td>");
	cycleCount++;

	return executionResult;
}

function writeMemory(executionResult) {

	if(executionResult.memoryState) {
		var newMemoryState = Object.assign({}, memory);
		var memoryLocation = executionResult.memoryState.memoryLocation;
		var value = executionResult.memoryState.value;
		newMemoryState[memoryLocation] = value;
		memoryStates.push(newMemoryState);
	}

	cycleData.push("<td>I" + (pcCounter + 1) + " - MEM</td>");
	cycleCount++;

}

function writeBack(executionResult) {

	if(executionResult.registerState) {
		var newRegisterState = Object.assign({}, registers);
		var register = executionResult.registerState.register;
		var value = executionResult.registerState.value;
		newRegisterState[register] = value;
		registerStates.push(newRegisterState);

		registers[register] = value;
	}

	cycleData.push("<td>I" + (pcCounter + 1) + " - WB</td>");
	cycleCount++;

}
