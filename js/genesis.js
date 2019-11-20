$("#search-again").append('<button id="iniciarScan" class="ui secondary button" type="button" >Iniciar Escaneo</button>');



$(document).on("click", "#iniciarScan", function() {

    var tablaMaterias = $("#table1");

    var totalMaterias = $('#table1 tr');

    //reCorrer Todos los tr

    var trFirst = $(totalMaterias[0]);
    trFirst.prepend('<th scope="col" data-sort-direction="disabled" class="sort-disabled add-col ui-state-default" data-property="add" xe-field="add" style="width: 8%;"><div class="title" style="width: auto;"></div><div class="sort-handle" style="height:100%;width:5px;cursor:w-resize;"></div></th>')

    for (var i = 1; i < totalMaterias.length; i++) {
        var trCurrent = $(totalMaterias[i]);
        var linkMateria = trCurrent.find(".section-details-link");
        var htmlCheck = '<input type="checkbox" class="checkMateria" value="' + linkMateria.data("attributes") + '">';
        trCurrent.prepend(htmlCheck);

    }

    //Lista de años

    $.ajax({
        url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/classSearch/getTerms?searchTerm=&offset=1&max=10',
        type: 'GET',
        success: function(respuesta) {
            console.log(respuesta);
        },
        error: function() {
            console.log("No se ha podido obtener la información");
        }
    });


    //Registrar el año a matricular (presencial virtual etc)
    $.ajax({
        url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/term/search?mode=search',
        type: 'post',
        data: {
            "term": 201980,
            "studyPath": "",
            "studyPathText": "",
            "startDatepicker": "",
            "endDatepicker": ""
        },
        success: function(respuesta) {
            console.log(respuesta);
        },
        error: function() {
            console.log("No se ha podido obtener la información");
        }
    });

    //Lista de programas 
    $.ajax({
        url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/classSearch/get_subject?searchTerm=&term=201980&offset=1&max=100',
        type: 'GET',
        success: function(respuesta) {
            console.log(respuesta);
        },
        error: function() {
            console.log("No se ha podido obtener la información");
        }
    });


    //Lista Materias por programa

    // Busca por termino     https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subject=ISUM&txt_keywordlike=teaorias&txt_term=202010&startDatepicker=&endDatepicker=&pageOffset=0&pageMaxSize=10&sortColumn=subjectDescription&sortDirection=asc

    //Busqueda por hora https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subject=ISUM&select_start_hour=08&select_start_min=00&select_start_ampm=AM&select_end_hour=09&select_end_min=00&select_end_ampm=AM&txt_term=202010&startDatepicker=&endDatepicker=&pageOffset=0&pageMaxSize=10&sortColumn=subjectDescription&sortDirection=asc

    //Dias hora https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subject=CTSO&chk_include_1=true&chk_include_2=true&chk_include_5=true&select_start_hour=01&select_start_min=00&select_start_ampm=PM&txt_term=202010&startDatepicker=&endDatepicker=&pageOffset=0&pageMaxSize=10&sortColumn=subjectDescription&sortDirection=asc

    $.ajax({
        url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subject=ISUM&txt_term=202010&startDatepicker=&endDatepicker=&pageOffset=10&pageMaxSize=100&sortColumn=subjectDescription&sortDirection=asc',
        success: function(respuesta) {
            console.log(respuesta);
        },
        error: function() {
            console.log("No se ha podido obtener la información");
        }
    });

    //detalle de materia
    $.ajax({
        url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/searchResults/getClassDetails',
        type: 'POST',
        data: {
            "term": 202010,
            "courseReferenceNumber": 1878,
            "first": "first"
        },
        success: function(respuesta) {
            console.log(respuesta);
        },
        error: function() {
            console.log("No se ha podido obtener la información");
        }
    });








});