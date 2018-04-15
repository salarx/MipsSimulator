
var instructions;
var registerStates;
var memoryStates;
var cycleData;

var currentStep = 0;

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
		$("#simulationRegisters").append("<tr><td>R" + key + "</td><td>" + registerStates[currentRegisterState][key] + "</td></tr>");
	}
}

function displayMemory(currentMemoryState) {

	for(var key in memoryStates[currentMemoryState]) {
		$("#simulationMemory").append("<tr><td>" + key + "</td><td>" + memoryStates[currentMemoryState][key] + "</td></tr>");
	}

}

function displayCycleData(currentCycleData) {




}

function simulate() {

	registerStates.push(registers);
	memoryStates.push(memory);

	for(var i = 0; i < instructions.length; i++) {



	}

}
