
var registers;
var memory;
var decodedCode;
var warnings;

var sections = {
  registers: {
    sectionName: "registers",
    stopCharacters: ["m", "c"]
  },
  memory: {
    sectionName: "memory",
    stopCharacters: ["r", "c"]
  },
  code: {
    sectionName: "code",
    stopCharacters: ["r", "m"]
  }
};

// Add event listeners for drag and drop and file upload input
// If browser cannot support drag and drop, hide drag and drop text
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

  $("input[type='file']").change(handleFileOnUpload);

  $("#uploadLink").on("click", function(event){
    event.preventDefault();
    $("#file:hidden").trigger("click");
  });

});

// Return bool whether browser can support drag and drop
function canDoDragAndDrop() {

  var div = document.createElement('div');

  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) &&
  'FormData' in window && 'FileReader' in window;
}

// Load sample input file from sampleInputs folder and run program
function loadDemoFile() {

  $.get("https://raw.githubusercontent.com/hunterhedges/mipsSimulator/master/sampleinputs/sample_1.txt", function( data ) {

    main(data);

  });

}

// Handler function for file upload or file drop event
// Checks that uploaded file is text file and not empty
// If file is correct format, load registers, memory and code for display
function handleFileOnUpload(event) {

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
        main(fileContent);
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
//  fileContent: string of text from file
// Return:
//  None
function main(fileContent) {

  fileContent = fileContent.toLowerCase();

  reset();

  loadRegisters(parseSection(fileContent, sections.registers));
  loadMemory(parseSection(fileContent, sections.memory));
  loadDecodedCode(parseSection(fileContent, sections.code));

  displayDecodedInstructions();
  displayWarnings();

}

// Parse section of text file
// Params:
//  fileContent: string of text in uploaded file
//  section: section to parse
// Return:
//  array with split lines of section
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

// Fill registers object with register number and value
// Params:
//  registerArray: parsed array from register section
// Return:
//  none
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

    for(j = j; j < registerArray[i].length; j++) {
      registerValue += registerArray[i].charAt(j);
    }

    if(isValidRegister(registerNumber)) {

      if(registerNumber.charAt(0) == "r") {
        registerNumber = registerNumber.replace("r", "");
      }

      if(isValidValue(registerValue)) {
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
//  register: register string
// Return:
//  bool: whether register is valid
function isValidRegister(register) {

  var registerNumber;
  var isValid = false;

  if(register.includes("r")) {
    registerNumber = parseInt(register.substring(1, register.length));
  }
  else {
    registerNumber = parseInt(register);
  }

  if(registerNumber) {

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

// Fill memory object with memory location and value
// Params:
//  memoryArray: parsed array from memory section
// Return:
//  none
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

    for(j = j; j < memoryArray[i].length; j++) {
      memoryValue += memoryArray[i].charAt(j);
    }

    if(isValidMemoryLocation(memoryLocation)) {

      if(memoryLocation.charAt(0) == "m") {
        memoryLocation = memoryLocation.replace("m", "");
      }

      if(isValidValue(memoryValue)) {
        memory[memoryLocation] = memoryValue;
      }
    }

  }

}

// Check that memory location is valid. Memory string must
// start with 'm' followed by number or only number.
// Memory location must be greater than 0 and divisble by 4.
// Params:
//  memoryLocation: memory string
// Return:
//  bool: whether memoryLocation is valid
function isValidMemoryLocation(memoryLocation) {

  var memoryNumber;
  var isValid = false;

  if(memoryLocation.includes("m")) {
    memoryNumber = parseInt(memoryLocation.substring(1, memoryLocation.length));
  }
  else {
    memoryNumber = parseInt(memoryLocation);
  }

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

// Read the opcode and funct code if applicable to determine
// which MIPS instruction the code is. Push a decoded string
// to decodedCode array.
// Params:
//  codeArray: parsed array from code section
// Return:
//  None
function loadDecodedCode(codeArray) {

  if(!codeArray) {
    return;
  }

  for(var i = 0; i < codeArray.length; i++) {

    codeArray[i] = codeArray[i].trim();
    codeArray[i] = codeArray[i].replace(/ /g,"");

    var opcode = "";
    var funct = "";
    var isValid = true;

    for(var j = 0; j < 6; j++) {
      opcode += codeArray[i].charAt(j);
    }

    switch(opcode) {
      case "000000":
      for(var j = codeArray[i].length - 6; j < codeArray[i].length; j++) {
        funct += codeArray[i].charAt(j);
      }

      if(funct == "100000") {
        decodedCode.push(decodeAdd(codeArray[i]));
      }
      else if(funct == "100010") {
        decodedCode.push(decodeSub(codeArray[i]));
      }
      else if(funct == "101010") {
        decodedCode.push(decodeSetOnLessThan(codeArray[i]));
      }
      else {
        warnings.push("Code <strong>" + codeArray[i] + "</strong> has an invalid funct code.");
        isValid = false;
      }
      break;
      case "001000":
      decodedCode.push(decodeAddi(codeArray[i]));
      break;
      case "000100":
      decodedCode.push(decodeBranchOnEqual(codeArray[i]));
      break;
      case "000101":
      decodedCode.push(decodeBranchNotEqual(codeArray[i]));
      break;
      case "100011":
      decodedCode.push(decodeLoadWord(codeArray[i]));
      break;
      case "101011":
      decodedCode.push(decodeStoreWord(codeArray[i]));
      break;
      default:
      warnings.push("Code <strong>" + codeArray[i] + "</strong> has an invalid opcode.");
      isValid = false;
      break;
    }
    if(isValid) {
      instructions.push(codeArray[i]);
    }
  }

}

// MIPS values must be 32 bit signed or unsigned number.
// For unsigned numbers, values must be between 0 and 4294967295.
// For signed numbers, values must be between -2147483648 and -2147483647.
// Params:
//  value: number to check for overflow
// Return:
//  bool: whether value is number and won't cause overflow
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

// Show instructions container
// Add registers, memory, and decoded code to container
// Smooth scroll to container
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

// Display warnings in modal to user
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

// Display modal to user
// Params:
//  modalTitle: string title of modal
//  modalBody: string of content for modal body
// Return:
//  None
function showModal(modalTitle, modalBody) {

  $("#modalTitle").html(modalTitle);
  $("#modalBody").html(modalBody);
  $("#modal").modal("show");

}

// Clear global variables
// Clear html inside instruction and simulation sections
// Hide instruction and simulation containers
function reset() {

  $("#decodedInstructionsContainer").hide();
  $("#decodedInstructions").html("");

  $("#simulationContainer").hide();
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
  cycleCount = 0;

  $('html, body').animate({
    scrollTop: 0 }, 500);

  }
