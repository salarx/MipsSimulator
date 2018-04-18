var instructions = [];
var registerStates = []; // only updated on write back
var memoryStates = []; // only updated on write memory
var cycleData = [];

var currentStep = 0;

var pcCounter = 0;
var cycleCounter = 1;

var previousExecutionResult;



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
	displayCycleData(currentStep + 1);

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
	displayCycleData(currentStep - 1);

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
	currentStep = decodedCode.length - 1;

	simulate();

	$("#simulationResultsContainer").show();
	displayInstructions(decodedCode.length - 1);
	displayRegisters(registerStates.length - 1);
	displayMemory(memoryStates.length - 1);
	displayCycleData(cycleData.length);

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

	$("#simulationCycleNumber").html("");
	$("#simulationCycleData").html("");

	$("#clockCycleTitle").attr("colspan", cycleCounter);

	for(var i = 1; i < cycleCounter; i++) {
		$("#simulationCycleNumber").append("<td>" + i + "</td>");
	}

	for(var i = 0; i < currentCycleData; i++) {
		var emptyCounter = 0;
		$("#simulationCycleData").append("<tr>");
		for(var j = 1; j < cycleCounter; j++) {

			if(j < cycleData[i].length) {
				if(cycleData[i][j]) {
					$("#simulationCycleData").append("<td>" + cycleData[i][j] + "</td>");
				}
				else {
					$("#simulationCycleData").append("<td></td>");
				}
			}
			else {
				$("#simulationCycleData").append("<td></td>");
			}


		}

		$("#simulationCycleData").append("</tr>");
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

		if(executionResult) {
			previousExecutionResult = executionResult;

			writeMemory(executionResult);

			writeBack(executionResult);

			pcCounter++;

			cycleCounter = cycleCounter - 4;
		}
		else {
			previousExecutionResult = null;
		}


	}

	cycleCounter += 4;

}

//
//
//
function instructionFetch() {

	cycleData.push([]);
	cycleData[pcCounter][cycleCounter] = "I" + (pcCounter + 1) + " - IF";
	cycleCounter++;

	return instructions[pcCounter];

}

//
//
//
function decodeAndExecute(instructionBinary) {

	if(previousExecutionResult) {
		stall(previousExecutionResult.stallAmount);

		if(previousExecutionResult.shouldBranch) {
			pcCounter += previousExecutionResult.branchOffset;
			cycleCounter++;

			memoryStates.push(Object.assign({}, memoryStates[memoryStates.length - 1]));
			registerStates.push(Object.assign({}, registerStates[registerStates.length - 1]));

			return;
		}
	}

	cycleData[pcCounter][cycleCounter] = "I" + (pcCounter + 1) + " - ID";
	cycleCounter++;

	var executionResult = findInstruction(instructionBinary, ACTIONS.EXECUTE);

	cycleData[pcCounter][cycleCounter] = "I" + (pcCounter + 1) + " - EX";
	cycleCounter++;

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

	}
	else {
		memoryStates.push(Object.assign({}, memoryStates[memoryStates.length - 1]));
	}

	cycleData[pcCounter][cycleCounter] = "I" + (pcCounter + 1) + " - MEM";
	cycleCounter++;

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

	}
	else {
		registerStates.push(Object.assign({}, registerStates[registerStates.length - 1]));
	}

	cycleData[pcCounter][cycleCounter] = "I" + (pcCounter + 1) + " - WB";
	cycleCounter++;

}

function stall(numberOfStalls) {

	for(var i = 0; i < numberOfStalls; i++) {
		cycleData[pcCounter][cycleCounter] = "I" + (pcCounter + 1) + " - Stall";
		cycleCounter++;
	}

}

function toggleView() {

}
