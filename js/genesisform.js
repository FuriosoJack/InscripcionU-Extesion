$("html").html("");

var tableHorarios;

function selectPeriodos() {

    //$("body").append('<li class="landing-path"><button id="initModalIncripcionesU" class="ui green button">Green</button></li>');

    //Poner La lista de periodos
    $.ajax({
        url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/classSearch/getTerms?searchTerm=&offset=1&max=1000',
        type: 'GET',
        success: function(respuesta) {

            for (var i = 0; i < respuesta.length; i++) {
                $("#selectPeriodo").append('<option value="' + respuesta[i].code + '">' + respuesta[i].description + '</option>');
            }


            $("#selectPeriodo").dropdown();

            $(document).on('change', '#selectPeriodo', function() {

                var select = $(this)
                var selected = select.find("option:selected");
                //Registrar el año a matricular (presencial virtual etc)
                $.ajax({
                    url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/term/search?mode=search',
                    type: 'post',
                    data: {
                        "term": selected.val(),
                        "studyPath": "",
                        "studyPathText": "",
                        "startDatepicker": "",
                        "endDatepicker": ""
                    },
                    success: function(respuesta) {

                        //Habilitar selec de programa
                        selectPograma(selected.val());

                    },
                    error: function() {
                        console.log("No se ha podido obtener la información");
                    }
                });
            });
        },
        error: function() {
            console.log("No se ha podido obtener la información");
        }
    });
}

function selectPograma(codePeriodo) {
    $("#selectProgramas").prop("disabled", false);

    //Lista de programas 
    $.ajax({
        url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/classSearch/get_subject?searchTerm=&term=' + codePeriodo + '&offset=1&max=10000',
        type: 'GET',
        success: function(respuesta) {
            var menu = $("#selectProgramas").find(".menu");
            for (var i = 0; i < respuesta.length; i++) {
                menu.append('<div class="item" data-value="' + respuesta[i].code + '">' + respuesta[i].description + '</div>');
            }
            $("#selectProgramas").dropdown({
                onChange: function(value, text, $choice) {
                    $.ajax({
                        url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subject=' + value + '&txt_term=' + codePeriodo + '&startDatepicker=&endDatepicker=&pageOffset=0&pageMaxSize=10000&sortColumn=subjectDescription&sortDirection=asc',
                        success: function(respuesta) {
                            if (respuesta.success) {
                                buildTableDatatables(respuesta.data);
                            }
                        },
                        error: function() {
                            console.log("No se ha podido obtener la información");
                        }
                    });
                }
            });


        },
        error: function() {
            console.log("No se ha podido obtener la información");
        }
    });
}



function buildTableDatatables(clases) {

    var data = [];
    for (var i = 0; i < clases.length; i++) {

        var clase = clases[i];
        var horariosObject = clase.meetingsFaculty;


        var horarios = "";
        if (horariosObject.length > 0) {

            var itemsHorarios = `<div class="ui relaxed divided list">`;


            for (var y = 0; y < horariosObject.length; y++) {

                var horarioObject = horariosObject[y];
                var horarioItemObject = horarioObject.meetingTime;

                //Veriricar que dia es
                var dia = "";
                if (horarioItemObject.friday) {
                    dia = "Viernes";
                } else if (horarioItemObject.monday) {
                    dia = "Lunes";
                } else if (horarioItemObject.saturday) {
                    dia = "Sabado";
                } else if (horarioItemObject.sunday) {
                    dia = "Domingo";
                } else if (horarioItemObject.thursday) {
                    dia = "Jueves";
                } else if (horarioItemObject.tuesday) {
                    dia = "Martes";
                } else if (horarioItemObject.wednesday) {
                    dia = "Miercoles";
                }


                var horario = ` <div class="item">
                                    <i class="large github middle aligned icon"></i>
                                    <div class="content">
                                    <a class="header">` + dia + `</a>
                                    <div class="description">Updated 34 mins ago</div>
                                    </div>
                                </div>`;

                itemsHorarios += horario;
            }
            itemsHorarios += `</div>`;
        }
        var materia = [
            `<div class="ui toggle checkbox">
                <input type="checkbox" name="public">
                <label></label>
            </div>
            `,
            clases[i].courseTitle,
            clases[i].courseReferenceNumber,
            clases[i].creditHourLow,
            itemsHorarios

        ];
        data.push(materia);
    }



    $("#tableHorarios").DataTable({ data: data, destroy: true, processing: true });


}


function buildTableHorarios(clases) {
    var tbody = $("#tableHorarios").find("tbody");
    tbody.html("");

    for (var i = 0; i < clases.length; i++) {

        tbody.append(`
            <tr>
                <td></td>
                <td>` + clases[i].courseTitle + `</td>
                <td> </td>
                <td> </td>
            </tr>
        `);
    }



}




$(document).ready(function() {


    var gridBasic = `<div class="ui internally celled grid">
    <div class="row">
      <div class="three wide column">
        <select class="ui fluid  dropdown" id="selectPeriodo">
         <option value="">Seleccione un Periodo</option>           
        </select>
        <div class="ui fluid search selection dropdown" disabled id="selectProgramas">
            <input type="hidden" name="programa">
            <i class="dropdown icon"></i>
            <div class="default text">Seleccione Programa</div>
            <div class="menu">
                        
            </div>
        </div>
      </div>
      <div class="threeten wide column">        
      <table class="ui selectable celled table" id="tableHorarios">
        <thead>
            <tr>
            <th>Seleccionar</th>
            <th>Nombre</th>
            <th>NRC</th>
            <th>Creditos</th>
            <th>Horarios</th>
            </tr>
        </thead>
        <tbody>
            
        </tbody>
        </table>
      </div>
    </div>
    <div class="row">
      <div class="three wide column">
        <img>
      </div>
      <div class="ten wide column">
        <p></p>
      </div>
      <div class="three wide column">
        <img>
      </div>
    </div>
  </div>`;
    $("body").append(gridBasic);

    tableHorarios = $("#tableHorarios").DataTable();
    selectPeriodos();

});