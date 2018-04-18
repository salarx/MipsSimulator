const SECTIONS = {
  REGISTERS: {
    sectionName: "registers",
    stopCharacters: ["m", "c"]
  },
  MEMORY: {
    sectionName: "memory",
    stopCharacters: ["r", "c"]
  },
  CODE: {
    sectionName: "code",
    stopCharacters: ["r", "m"]
  }
};

var registers = {};
var memory = {};
var decodedCode = [];
var warnings = [];

// Add event listeners for drag and drop and file upload input
// If browser cannot support drag and drop, hide drag and drop text
// Runs once document is loaded.
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

  $("#uploadContainer").on("drop", readFileOnUpload);

  $("input[type='file']").change(readFileOnUpload);

  $("#uploadLink").on("click", function(event){
    event.preventDefault();
    $("#file:hidden").trigger("click");
  });

});

// Determine if browser can handle dragging and dropping files.
// Params:
//  None
// Return:
//  Bool whether browser can handle drag and drop
function canDoDragAndDrop() {

  var div = document.createElement('div');

  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) &&
  'FormData' in window && 'FileReader' in window;

}

// Read demo text file from Github and parse.
// Params:
//  None
// Return:
//  None
function readDemoFile() {

  const DEMO_FILE_LINK = "https://raw.githubusercontent.com/hunterhedges/mipsSimulator/master/sampleinputs/sample_1.txt";

  $.get(DEMO_FILE_LINK, function(data) {
    parseInputFile(data);
  });

}

// Read text file from upload, check validity of file, and parse.
// Display warning on empty text file or incorrect file type.
// Params:
//  Event from drag and drop or file upload link
// Return:
//  None
function readFileOnUpload(event) {

  var droppedFile;

  if(event.type == "drop") {
    droppedFile = event.originalEvent.dataTransfer.files[0];
  }
  else if(event.type == "change") {
    droppedFile = $("#file")[0].files[0];
  }

  if(droppedFile.type.includes("text")) {
    const reader = new FileReader();

    reader.onload = function(event) {
      var fileContent = event.target.result;

      if(fileContent.isNullOrEmpty()) {
        showModal("Error Uploading File", "File is empty");
      }
      else {
        parseInputFile(fileContent);
      }
    };

    reader.readAsText(droppedFile);
  }
  else {
    showModal("Error Uploading File", "Incorrect file type");
  }

}

// Primary function to run program. Reset, load registers,
// memory, and decoded instructions then display.
// Params:
//  String of text in uploaded file
// Return:
//  None
function parseInputFile(fileContent) {

  reset();

  fileContent = fileContent.toLowerCase();

  loadRegisters(parseSection(fileContent, SECTIONS.REGISTERS));
  loadMemory(parseSection(fileContent, SECTIONS.MEMORY));
  loadDecodedCode(parseSection(fileContent, SECTIONS.CODE));

  displayDecodedInstructions();
  displayWarnings();

}

// Parse section of text file.
// Params:
//  String of text in uploaded file
//  Section to parse
// Return:
//  Array of strings from section split by lines or null if section does not exist
function parseSection(fileContent, section) {

  var sectionString = "";
  var sectionArray;
  var i = 0;

  if(fileContent.includes(section.sectionName)) {
    i = fileContent.indexOf(section.sectionName) + section.sectionName.length;

    while(!section.stopCharacters.includes(fileContent.charAt(i)) && i < fileContent.length) {
      sectionString += fileContent.charAt(i);
      i++;
    }

    sectionArray = sectionString.split("\n");
    sectionArray = sectionArray.removeEmptyElements();

  }
  else {
    warnings.push("<strong>" + section.sectionName.toUpperCase() + "</strong> section not found in file.");
  }

  return sectionArray;

}

// Separate lines of register section into register number and value,
// then set the values in registers.
// Params:
//  Array of strings from register section
// Return:
//  None
function loadRegisters(registerArray) {

  if(!registerArray) {
    return;
  }

  for(var i = 0; i < registerArray.length; i++) {
    var j = 0;
    var registerNumber = "";
    var registerValue = "";

    while(registerArray[i].charAt(j) != " " && j < registerArray[i].length) {
      registerNumber += registerArray[i].charAt(j);
      j++;
    }

    for(j = j + 1; j < registerArray[i].length; j++) {
      registerValue += registerArray[i].charAt(j);
    }

    if(registerNumber.charAt(0) == "r") {
      registerNumber = registerNumber.replace("r", "");
    }

    if(isValidRegister(registerNumber)) {
      if(isValidValue(registerValue)) {
        registerValue = parseInt(registerValue);
        registers[registerNumber] = registerValue;
      }
    }

  }

}

// Check that register number is valid. Register string must
// start with 'r' followed by number or only number. MIPS
// only has registers valued between 0 and 31 inclusive.
// Register 0 is always equal to 0.
// Params:
//  String relating to register
// Return:
//  Bool whether register is valid
function isValidRegister(register) {

  var registerNumber;
  var isValid = false;

  registerNumber = parseInt(register);

  if(registerNumber || registerNumber == 0) {

    if(registerNumber > 0 && registerNumber < 32) {
      isValid = true;
    }
    else {
      warnings.push("Register <strong>" + register + "</strong> must be between 1 and 31 inclusive.");
    }
  }
  else {
    warnings.push("Register <strong>" + register + "</strong> could not be parsed.");
  }

  return isValid;

}

// Separate lines of memory section in memory location and value,
// then set the values in memory.
// Params:
//  Array of strings from memory section
// Return:
//  None
function loadMemory(memoryArray) {

  if(!memoryArray) {
    return;
  }

  for(var i = 0; i < memoryArray.length; i++) {
    var j = 0;
    var memoryLocation = "";
    var memoryValue = "";

    while(memoryArray[i].charAt(j) != " " && j < memoryArray[i].length) {
      memoryLocation += memoryArray[i].charAt(j);
      j++;
    }

    for(j = j + 1; j < memoryArray[i].length; j++) {
      memoryValue += memoryArray[i].charAt(j);
    }

    if(memoryLocation.charAt(0) == "m") {
      memoryLocation = memoryLocation.replace("m", "");
    }

    if(isValidMemoryLocation(memoryLocation)) {
      if(isValidValue(memoryValue)) {
        memoryValue = parseInt(memoryValue);
        memory[memoryLocation] = memoryValue;
      }
    }

  }

}

// Check that memory location is valid. Memory string must
// start with 'm' followed by number or only number.
// Memory location must be greater than 0, less than 2^4 (65280),
// and divisible by 4.
// Params:
//  String relating to memory location
// Return:
//  Bool whether memory location is valid
function isValidMemoryLocation(memoryLocation) {

  var memoryNumber;
  var isValid = false;

  memoryNumber = parseInt(memoryLocation);

  if(memoryNumber) {
    if(memoryNumber >= 0 && memoryNumber < 65280 && memoryNumber % 4 == 0) {
      isValid = true;
    }
    else {
      warnings.push("Memory location <strong>" + memoryLocation + "</strong> must be greater than 0, less than 65280, and divisible by 4.");
    }
  }
  else {
    warnings.push("Memory location <strong>" + memoryLocation + "</strong> could not be parsed.");
  }

  return isValid;

}

// Read the opcode and function code if applicable to determine
// which MIPS instruction the code is. Push a decoded string
// to decodedCode array or push warning.
// Params:
//  Array of strings from code section
// Return:
//  None
function loadDecodedCode(codeArray) {

  if(!codeArray) {
    return;
  }

  for(var i = 0; i < codeArray.length; i++) {
    codeArray[i] = codeArray[i].replace(/ /g,"");

    var result = findInstruction(codeArray[i], ACTIONS.DECODE);

    if(result) {
      decodedCode.push(result);
      // Instructions used in simulation 
      instructions.push(codeArray[i]);
    }
    else {
      warnings.push("Code <strong>" + codeArray[i] + "</strong> is not a valid instruction.");
    }

  }

}

// MIPS values must be 32 bit signed or unsigned number.
// For unsigned numbers, values must be between 0 and 4294967295.
// For signed numbers, values must be between -2147483648 and -2147483647.
// Params:
//  Integer to check
// Return:
//  Bool whether value is integer and won't cause overflow
function isValidValue(value) {

  var isValid = false;

  value = parseInt(value, 10);

  if(value || value == 0) {

    if(value <= 4294967295 && value >= -2147483648) {

      isValid = true;
    }
    else {
      warnings.push("Value <strong>" + value + "</strong> will result in overflow.");
    }
  }
  else {
    warnings.push("Value <strong>" + value + "</strong> could not be parsed.");
  }

  return isValid;

}

// Show instructions container, then add registers, memory,
// and decoded code to container. Smooth scroll to container.
// Params:
//  None
// Return:
//  None
function displayDecodedInstructions() {

  $("#decodedInstructionsContainer").show();

  $("#decodedInstructions").append("REGISTERS<br />");
  for(var key in registers) {
    $("#decodedInstructions").append("R" + key + " " + registers[key] + "<br />");
  }

  if(registers.length == 0) {
    $("#decodedInstructions").append("All registers set to 0<br />");
  }

  $("#decodedInstructions").append("<br />");

  $("#decodedInstructions").append("MEMORY<br />");
  for(var key in memory) {
    $("#decodedInstructions").append(key + " " + memory[key] + "<br />");
  }

  if(memory.length == 0) {
    $("#decodedInstructions").append("All memory locations set to 0<br />");
  }

  $("#decodedInstructions").append("<br />");

  $("#decodedInstructions").append("CODE<br />");
  for(var i = 0; i < decodedCode.length; i++) {
    $("#decodedInstructions").append(decodedCode[i] + "<br />");
  }

  if(decodedCode.length == 0) {
    $("#decodedInstructions").append("No code detected");
  }

  $('html, body').animate({
    scrollTop: $("#decodedInstructionsContainer").offset().top - 20
  }, 500);

}

// Display warnings to user in modal.
// Params:
//  None
// Return:
//  None
function displayWarnings() {

  if(warnings.length != 0) {
    const warningsTitle = "Warnings";
    var warningsBody = "";

    for(var i = 0; i < warnings.length; i++) {
      warningsBody += (i+1) + ". " + warnings[i] + "<br />";
    }

    showModal(warningsTitle, warningsBody);
  }

}

// Display modal to user.
// Params:
//  String for title of modal
//  String for content of modal body
// Return:
//  None
function showModal(modalTitle, modalBody) {

  $("#modalTitle").html(modalTitle);
  $("#modalBody").html(modalBody);
  $("#modal").modal("show");

}

// Clear global variables, clear html in all containers, hide
// all containers and scroll back to top of screen.
// Params:
//  None
// Return:
//  None
function reset() {

  $("#decodedInstructionsContainer").hide();
  $("#decodedInstructions").html("");

  $("#simulationResultsContainer").hide();
  $("#simulationInstructions").html("");
  $("#simulationRegisters").html("");
  $("#simulationMemory").html("");
  $("#simulationCycleData").html("");

  registers = {};
  memory = {};
  decodedCode = [];
  warnings = [];

  instructions = [];
  registerStates = [];
  memoryStates = [];
  cycleData = [];

  pcCounter = 0;
  cycleCount = 1;

  $('html, body').animate({
    scrollTop: 0 }, 500);

  }
