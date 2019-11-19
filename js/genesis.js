$("#search-again").append('<button id="iniciarScan" class="form-button section-search" type="button" >Iniciar Escaneo</button>');



$(document).on("click", "#iniciarScan", function() {

    var tablaMaterias = $("#table1");

    var totalMaterias = $('#table1 tr');

    //reCorrer Todos los tr

    var trFirst = $(totalMaterias[0]);
    trFirst.prepend('<th scope="col" data-sort-direction="disabled" class="sort-disabled add-col ui-state-default" data-property="add" xe-field="add" style="width: 8%;"><div class="title" style="width: auto;"></div><div class="sort-handle" style="height:100%;width:5px;cursor:w-resize;"></div></th>')

    for (var i = 1; i < totalMaterias.length; i++) {
        var trCurrent = $(totalMaterias[i]);
        var htmlCheck = '<input type="checkbox" class="checkMateria" value="' + trCurrent.attr("data-id") + '">';
        trCurrent.prepend(htmlCheck);

    }

});