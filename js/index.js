var regexGeneral = "(A{5})|(B{2}A{2}B)|(CDB{2}C)|(C{2}BAD)|(ACA{2}E)";
var emociones = {
    "BABAB": "AGRADO",
    "AABAB": "ALEGRIA",
    "DCDBC": "DISGUSTO",
    "DCDAD": "ASCO",
    "ADEAE": "TRISTEZA"
}

$(".alfabeto").click(function() {

    alert(localStorage.getItem("coo"));

    var name = $(this).find(".header").html();
    var val = $(this).attr("val");

    $("#listaActual").append("<li>" + name + "</li>");

    $("#cadenaActual").html($("#cadenaActual").html() + val);


    var cadenaActual = String($("#cadenaActual").html());

    var count = (cadenaActual.match("(A{5})|(B{2}A{2}B)|(CDB{2}C)|(C{2}BAD)|(ACA{2}E)") || []).length;
    console.log(count);


});