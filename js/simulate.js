var instructions = [];
var registerStates = [];
var memoryStates = [];
var cycleData = [];

var currentStep = 0;

var pcCounter = 0;
var cycleCounter = 1;

var previousExecutionResult;

// Initiate the step through. Get simulation data, then show
// it starting with the initial conditions. Disable previous
// step button.
// Params:
//	None
// Return:
//	None
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

// Display updated simulation results to the next step.
// Disable next button if end is reached. Enable prev
// step button if beginning is left.
// Params:
//	None
// Return:
//	None
function nextStep() {

	currentStep++;

	displayInstructions(currentStep);
	displayRegisters(currentStep);
	displayMemory(currentStep);
	displayCycleData(currentStep);

	if(currentStep == decodedCode.length - 1) {
		$("#nextStepBtn").attr("disabled", "disabled");
	}

	if(currentStep != 0) {
		$("#prevStepBtn").removeAttr("disabled");
	}

}

// Display updated simulation results to the previous step.
// Disable previous button if begnning is reached. Enable
// next button if end is left.
// Params:
//	None
// Return:
//	None
function previousStep() {

	currentStep--;

	displayInstructions(currentStep);
	displayRegisters(currentStep);
	displayMemory(currentStep);
	displayCycleData(currentStep);

	if(currentStep == 0) {
		$("#prevStepBtn").attr("disabled", "disabled");
	}

	if(currentStep != decodedCode.length - 1) {
		$("#nextStepBtn").removeAttr("disabled");
	}

}

// Run simulation and display results from end. Disable
// next step button.
// Params:
//	None
// Return:
//	None
function executeAll() {

	decodedCode.push("END");
	currentStep = decodedCode.length - 1;

	simulate();

	$("#simulationResultsContainer").show();
	displayInstructions(decodedCode.length - 1);
	displayRegisters(registerStates.length - 1);
	displayMemory(memoryStates.length - 1);
	displayCycleData(cycleData.length);

	$("#nextStepBtn").attr("disabled", "disabled");

	$('html, body').animate({
		scrollTop: $("#simulationResultsContainer").offset().top - 20
	}, 500);

}

// Display all instructions in human readable code. Put arrow
// next to instruction that current step is about to execute.
// Params:
//	Integer of the current step in simulation
// Return:
//	None
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

// Display all non-zero register values from simulation
// results based on step in register states.
// Params:
//	Integer of the current step in simulation
// Return:
//	None
function displayRegisters(currentRegisterState) {

	$("#simulationRegisters").html("");

	for(var key in registerStates[currentRegisterState]) {
		if(registerStates[currentRegisterState][key]) {
			$("#simulationRegisters").append("<tr><td>R" + key + "</td><td>" + registerStates[currentRegisterState][key] + "</td></tr>");
		}
	}

}

// Display all non-zero memory values from simluation
// results based on step in memory states.
// Params:
//	Integer of the current step in simulation
// Return:
//	None
function displayMemory(currentMemoryState) {

	$("#simulationMemory").html("");

	for(var key in memoryStates[currentMemoryState]) {
		if(memoryStates[currentMemoryState][key]){
			$("#simulationMemory").append("<tr><td>" + key + "</td><td>" + memoryStates[currentMemoryState][key] + "</td></tr>");
		}
	}

}

// Display cycle data based up to current step in simulation.
// Each row refers to a different instruction while each column
// is a different clock cycle.
// Params:
//	Integer of the current step in simulation
// Return:
//	None
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

// Load inital register and memory values into register states.
// The pcCounter points to the instruction to be fetched.
// If the previous execution result is null, then it was a branch
// and is reason to skip the next x amount of instructions while still
// fetching the first after.
// Params:
//	None
// Return:
//	None
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

// Pushes new array of instruction information to cycleData.
// Writes the fetched information to cycleData and increments
// cycleCounter.
// Params:
//	None
// Return:
//	binaryInstructionString corresponding to pcCounter
function instructionFetch() {

	cycleData.push([]);
	cycleData[pcCounter][cycleCounter] = "I" + (pcCounter + 1) + " - IF";
	cycleCounter++;

	return instructions[pcCounter];

}

// If previous execution result exists then stall based on
// that previous instruction. If branch, then don't execute
// current instruction. Write decode and execution to cycleData,
// and increment cycleCounter after both.
// Params:
//	String of 32-bit binary instruction
// Return:
//	ExecutionResult from execution instruction or null on
// 	case of previousExecutionResult being a branch
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

// If execution result contains changes to memory, then
// add those changes to the memoryStates and current memory.
// Else push copy of memory to memoryStates. Add memory information
// to cycleData.
// Params:
//	ExecutionResult from execution of instruction
// Return:
//	None
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

// If execution result contains changes to registers, then
// add those changes to the registerStates and current registers.
// Else push a copy of registers to registerStates. Add register
// information to cycleData.
// Params:
//	ExecutionResult from execution of instruction
// Return:
//	None
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

// Add stalls to current instruction based on previous instruction.
// Write the stalls to cycleData.
// Params:
//	Integer of number of stalls from ExecutionResult
// Return:
//	None
function stall(numberOfStalls) {

	for(var i = 0; i < numberOfStalls; i++) {
		cycleData[pcCounter][cycleCounter] = "I" + (pcCounter + 1) + " - Stall";
		cycleCounter++;
	}

}

// Create downloadable text file link.
// Params:
//	None
// Return:
//	None
function download() {

}
