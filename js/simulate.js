function simulate() {

	$("#simulationBox").css("display", "block");

	$('html, body').animate({
        scrollTop: $("#simulationBox").offset().top
    }, 500);

}