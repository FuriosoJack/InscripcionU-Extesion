$("html").html("");

var gridBasic = `<div class="ui internally celled grid">
<div class="row">
  <div class="three wide column">
    <select class="ui fluid  dropdown" id="selectPeriodo">
     <option value="">Seleccione un Periodo</option>           
    </select>
    <div class="ui fluid search selection dropdown" disabled id="selectProgramas">
        <input type="hidden" name="programa">
        <i class="dropdown icon"></i>
        <div class="default text"></div>
        <div class="menu">
                    
        </div>
    </div>
    <button class="ui primary button" id="resetAll">
  Save
</button>
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



var tableHorarios;

$(document).ready(function(){

   // tableHorarios = $("#tableHorarios").DataTable();
    
    
        //Poner La lista de periodos
        $.ajax({
            url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/classSearch/getTerms?searchTerm=&offset=1&max=1000',
            type: 'GET',
            success: function(respuesta) {
    
                for (var i = 0; i < respuesta.length; i++) {
                    $("#selectPeriodo").append('<option value="' + respuesta[i].code + '">' + respuesta[i].description + '</option>');
                }
    
    
                $("#selectPeriodo").dropdown({
                        onChange: function(value, text, $choice){
                            alert(value);
                             
                            $("#selectProgramas").prop("disabled", true);                            
                            //Registrar el año a matricular (presencial virtual etc)
                            $.ajax({
                                url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/term/search?mode=search',
                                type: 'post',
                                data: {
                                    "term": value,
                                    "studyPath": "",
                                    "studyPathText": "",
                                    "startDatepicker": "",
                                    "endDatepicker": ""
                                },
                                success: function(respuesta) {

                                    //Habilitar selec de programa
                                    selectPograma(value);

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
       
    


    $("#resetAll").click(function(){
        inicializarSelectProgramas();
    });

    function inicializarSelectProgramas()
    {
        $('#selectProgramas').dropdown('destroy');
        $("#selectProgramas").find(".item").remove();
        $("#selectProgramas").find("input[type='hidden']").val("");
        $("#selectProgramas").find(".text").html("Seleccione Programa");
        $("#selectProgramas").find(".text").addClass("default");
    }

    function selectPograma(codePeriodo) {
        
    
        //Lista de programas 
        $.ajax({
            url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/classSearch/get_subject?searchTerm=&term=' + codePeriodo + '&offset=1&max=10000',
            type: 'GET',
            success: function(respuesta) {

                $("#selectProgramas").prop("disabled", false);
                inicializarSelectProgramas();

                var menu = $("#selectProgramas").find(".menu");
                for (var i = 0; i < respuesta.length; i++) {
                    menu.append('<div class="item" data-value="' + respuesta[i].code + '">' + respuesta[i].description + '</div>');
                }                
                $("#selectProgramas").dropdown({
                    onChange: function(value, text, $choice) {

                        //Verificar si toca resetear la seleccion

                        
                        if($("#selectProgramas").find(".text").html() != ""){
                            $.ajax({
                                url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/classSearch/resetDataForm',
                                type: 'POST',
                                success: function(respuesta) {
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
                                },
                                error: function() {
                                    console.log("No se ha podido obtener la información");
                                }
                            });
                        }else{
                            $.ajax({
                                url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subject=' + value + '&txt_term=' + codePeriodo + '&startDatepicker=&endDatepicker=&pageOffset=0&pageMaxSize=10000&sortColumn=subjectDescription&sortDirection=asc',
                                success: function(respuesta) {
                                    if (respuesta.success) {
                                        buildTableHorarios(respuesta.data);
                                    }
                                },
                                error: function() {
                                    console.log("No se ha podido obtener la información");
                                }
                            });
                        }                        
                       
                    }
                });
    
    
            },
            error: function() {
                console.log("No se ha podido obtener la información");
            }
        });
    }
    
    
    
    function buildJsonMaterias(clases)
    {

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

        return data;

    }
    
    function buildTableDatatables(clases) {
               
    
        var data = buildJsonMaterias(clases);
       
    
        var tableHorarios = $("#tableHorarios").DataTable({ data: data, bDestroy:true ,destroy: true, processing: true });
     

    
    }
    
    
    function buildTableHorarios(clases) {

        var data = buildJsonMaterias(clases);
        var tbody = $("#tableHorarios").find("tbody");
        tbody.html("");
    
        for (var i = 0; i < data.length; i++) {
    
            tbody.append(`
                <tr>
                <td>` +  data[i][0]+ `</td>
                    <td>` +  data[i][1]+ `</td>
                    <td>` +  data[i][2]+ `</td>
                    <td>` +  data[i][3]+ `</td>
                    <td>` +  data[i][4]+ `</td>
                </tr>
            `);
        }
    
    
    }
    
});

