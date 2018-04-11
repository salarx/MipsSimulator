var instructionCache = [];

var pcCounter = 0;
var cycleCount = 0;

function simulate() {

	$("#simulationBox").css("display", "block");

	$('html, body').animate({
        scrollTop: $("#simulationBox").offset().top
    }, 500);

   // for(var i = 0; i < instructionCache.length; i++) {
   // 	instructionFetch();
   // }

   displaySimulationResults();

}

function instructionFetch() {

	instructions[pcCounter]
}

function instructionDecode() {

}

function execute() {

}

function memoryAccess() {

}

function writeBack() {

}

function getCycleCountDisplay() {

	var cycleCountDisplay = "<tr>";
	cycleCount = instructionCache.length * 5;

   for(var i = 1; i <= cycleCount; i++) {

   		cycleCountDisplay += "<td>" + i + "</td>";
   }

   cycleCountDisplay += "</tr>";

   return cycleCountDisplay;
}

function getInstructionRowDisplay() {

	var instructionRowDisplay = "<tr>";

	instructionRowDisplay += "<tr><td>I" + 1 + " IF</td>\
								  <td>I" + 1 + " ID</td>\
								  <td>I" + 1 + " EX</td>\
								  <td>I" + 1 + " MEM</td>\
								  <td>I" + 1 + " WB</td></tr>";

	for(var i = 2; i <= instructionCache.length; i++) {

		var colspan = (i - 1) * 5;

		instructionRowDisplay += "<tr><td colspan=" + colspan + ">\
								  <td>I" + i + " IF</td>\
								  <td>I" + i + " ID</td>\
								  <td>I" + i + " EX</td>\
								  <td>I" + i + " MEM</td>\
								  <td>I" + i + " WB</td></tr>";
	}

	return instructionRowDisplay;
}

function displaySimulationResults() {

	var cycleCountDisplay = getCycleCountDisplay();
	var instructionRowDisplay = getInstructionRowDisplay();

	$("#simulationBox").append("<center>SIMULATION RESULTS</center>");

	$("#simulationBox").append("<div class='table-responsive'><table class='table table-bordered table-sm'>\
   							    <tr><td class='text-center' colspan=" + cycleCount + ">Clock Cycle</td></tr>" +
           					    cycleCountDisplay + instructionRowDisplay + "</table></div>");
}