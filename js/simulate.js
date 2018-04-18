var instructions = [];
var registerStates = []; // only updated on write back
var memoryStates = []; // only updated on write memory
var pcCounterStates = []; // used to track order of instructions when branching
var cycleData = [];

var currentStep = 0;

var pcCounter = 0;
var cycleCount = 1;



//
//
//
function stepThrough() {

	decodedCode.push("END");
	simulate();

	$("#simulationResultsContainer").show();
	displayInstructions(0);
	displayRegisters(0);
	displayMemory(0);

	$("#prevStepBtn").attr("disabled", "disabled");

	$('html, body').animate({
		scrollTop: $("#simulationResultsContainer").offset().top - 20
	}, 500);

}

//
//
//
function nextStep() {

	displayInstructions(currentStep + 1);
	displayRegisters(currentStep + 1);
	displayMemory(currentStep + 1);

	currentStep++;

	if(currentStep == decodedCode.length - 1) {
		$("#nextStepBtn").attr("disabled", "disabled");
	}

	if(currentStep != 0) {
		$("#prevStepBtn").removeAttr("disabled");
	}


}

//
//
//
function previousStep() {

	displayInstructions(currentStep - 1);
	displayRegisters(currentStep - 1);
	displayMemory(currentStep - 1);

	currentStep--;

	if(currentStep == 0) {
		$("#prevStepBtn").attr("disabled", "disabled");
	}

	if(currentStep != decodedCode.length - 1) {
		$("#nextStepBtn").removeAttr("disabled");
	}


}

//
//
//
function executeAll() {

	decodedCode.push("END");
	simulate();

	$("#simulationResultsContainer").show();
	displayInstructions(instructions.length - 1);
	displayRegisters(registerStates.length - 1);
	displayMemory(memoryStates.length - 1);
//	displayCycleData();

	$('html, body').animate({
		scrollTop: $("#simulationResultsContainer").offset().top - 20
	}, 500);

}

//
//
//
function displayInstructions(currentInstruction) {

$("#simulationInstructions").html("");

	for(var i = 0; i < decodedCode.length; i++) {
		if(i == currentInstruction) {
			$("#simulationInstructions").append("<tr><td>&rarr;</td><td>" + decodedCode[i] + "</td></tr>");
		}
		else {
			$("#simulationInstructions").append("<tr><td></td><td>" + decodedCode[i] + "</td></tr>");
		}
	}

}

//
//
//
function displayRegisters(currentRegisterState) {

$("#simulationRegisters").html("");

	for(var key in registerStates[currentRegisterState]) {
		if(registerStates[currentRegisterState][key]) {
			$("#simulationRegisters").append("<tr><td>R" + key + "</td><td>" + registerStates[currentRegisterState][key] + "</td></tr>");
		}
	}
}

//
//
//
function displayMemory(currentMemoryState) {
$("#simulationMemory").html("");
	for(var key in memoryStates[currentMemoryState]) {
		if(memoryStates[currentMemoryState][key]){
			$("#simulationMemory").append("<tr><td>" + key + "</td><td>" + memoryStates[currentMemoryState][key] + "</td></tr>");
		}
	}

}

//
//
//
function displayCycleData(currentCycleData) {

	$("#clockCycleTitle").attr("colspan", cycleData.length);

	for(var i = 1; i <= cycleCount; i++) {
		$("#simulationCycleNumber").append("<td>" + i + "</td>");
	}

	for(var i = 0; i < cycleData.length; i++) {
		$("#simulationCycleData").append(cycleData[i]);
	}

}

//
//
//
function simulate() {

	registerStates.push(Object.assign({}, registers));
	memoryStates.push(Object.assign({}, memory));

	while(pcCounter < instructions.length) {

		var instruction = instructionFetch();

		var executionResult = decodeAndExecute(instruction);

		if(executionResult.shouldBranch) {
			pcCounter += executionResult.branchOffset;
		}

		writeMemory(executionResult);

		writeBack(executionResult);

		pcCounter++;

	}

}

//
//
//
function instructionFetch() {

	cycleData.push("I" + (pcCounter + 1) + " - IF");
	cycleCount++;

	return instructions[pcCounter];

}

//
//
//
function decodeAndExecute(instructionBinary) {

	var opcode = "";
	var funct = "";
	var executionResult;

	cycleData.push("I" + (pcCounter + 1) + " - ID");
	cycleCount++;

	executionResult = findInstruction(instructionBinary, ACTIONS.EXECUTE);

	cycleData.push("I" + (pcCounter + 1) + " - EX");
	cycleCount++;

	return executionResult;

}

//
//
//
function writeMemory(executionResult) {

	if(executionResult.memoryState) {
		var newMemoryState = Object.assign({}, memory);
		var memoryLocation = executionResult.memoryState.memoryLocation;
		var value = executionResult.memoryState.value;
		newMemoryState[memoryLocation] = value;
		memoryStates.push(newMemoryState);

		memory[memoryLocation] = value;

		cycleData.push("I" + (pcCounter + 1) + " - MEM");
		cycleCount++;
	}
	else {
		memoryStates.push(Object.assign({}, memory));
	}

}

//
//
//
function writeBack(executionResult) {

	if(executionResult.registerState) {
		var newRegisterState = Object.assign({}, registers);
		var register = executionResult.registerState.register;
		var value = executionResult.registerState.value;
		newRegisterState[register] = value;
		registerStates.push(newRegisterState);

		registers[register] = value;

		cycleData.push("I" + (pcCounter + 1) + " - WB");
		cycleCount++;
	}
	else {
		registerStates.push(Object.assign({}, registers));
	}

}

function toggleView() {

}
