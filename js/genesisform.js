$("html").html("");

var gridBasic = `<div class="ui internally celled grid">
<div class="row">
  <div class="four wide column">
  <form class="ui form">
  <div class="field">
        <label>Selecionar Periodo</label>
        <select class="ui fluid  dropdown" id="selectPeriodo">
            <option value="">Seleccione un Periodo</option>           
       </select>
    </div>
    <div class="field">
        <label>Selecionar Programa</label>
            <div class="ui fluid search selection dropdown" disabled id="selectProgramas">
            <input type="hidden" name="programa">
            <i class="dropdown icon"></i>
            <div class="default text"></div>
            <div class="menu">
                    
            </div>
    </div>  
    </div>
  </form>
  </div>
  <div class="twelve wide column">
  <div class="ui dimmer"  id="loadingSearchMaterias">
    <div class="ui indeterminate text loader">Cargando Materias</div>
  </div>

  <table class="ui selectable celled table" id="tableHorarios">
    <thead>
        <tr>
        <th>Seleccionar</th>
        <th>Nombre</th>
        <th>NRC</th>
        <th>Creditos</th>
        <th>Horarios</th>
        <th>Programa</th>
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

var periodoCurrent;
var programaCurrent;
var materiasCurrent;

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
                                    periodoCurrent = value;
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

                        
                        //Mostrar loading
                        $("#loadingSearchMaterias").dimmer("show");

                        programaCurrent = value;

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
                                },
                                complete: function(){
                                   
                                }
                            });
                        }else{
                            $.ajax({
                                url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subject=' + value + '&txt_term=' + codePeriodo + '&startDatepicker=&endDatepicker=&pageOffset=0&pageMaxSize=10000&sortColumn=subjectDescription&sortDirection=asc',
                                success: function(respuesta) {
                                    if (respuesta.success && !respuesta.isNull("data")) {
                                        materiasCurrent = respuesta.data;
                                        buildTableHorarios(respuesta.data);
                                    }
                                },
                                error: function() {
                                    console.log("No se ha podido obtener la información");
                                },
                                complete: function(){
                                    
                                }
                            });
                        }                        
                       
                    }
                });

                $("#selectProgramas").addClass("success");
    
    
            },
            error: function() {
                console.log("No se ha podido obtener la información");
            }
        });
    }
    
    function inicializarSelectProgramas()
    {
        $('#selectProgramas').dropdown('destroy');
        $("#selectProgramas").find(".item").remove();
        $("#selectProgramas").find("input[type='hidden']").val("");
        $("#selectProgramas").find(".text").html("Seleccione Programa");
        $("#selectProgramas").find(".text").addClass("default");
        $("#selectProgramas").removeClass("success");
    }

    function buildTableDatatables(clases) {
               
    
       var data = buildJsonMaterias(clases);
       console.log("CLases:");
       console.log(data);
    
        var tableHorarios = $("#tableHorarios").DataTable({ 
            data: data, 
            destroy: true,
            processing: true,
            scrollY: "60vh",
        });

        $("#loadingSearchMaterias").dimmer("hide");
        $(".saveMateria").checkbox({
            onChecked: function(element)
            {
                var res = alasql('SELECT * FROM ? WHERE id = '+$(this).val() ,[clases]);                
                //Si hay un resultado se guarda
                if(res.length > 0){
                    guardarMateria(res[0]);
                }
                
                
            },
            onUnchecked: function()
            {
                alert("eliminar");
            }
    
        });

       
        

    
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
    
    
    function buildJsonMaterias(clases)
    {

        var data = [];
        for (var i = 0; i < clases.length; i++) {
    
            var clase = clases[i];
            var horariosObject = clase.meetingsFaculty;
    
    
            var itemsHorarios = "Sin Horarios";
            if (horariosObject.length > 0) {
    
                itemsHorarios = `<div class="ui horizontal bulleted link list"><a class="item"></a>`;
    
    
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
    
    
                    var horario = ` <a class="item">Dia: ` + dia + 
                    ` | Hora Inicio-> ` +
                    (horarioItemObject.beginTime.substring(0,2) + ":" + horarioItemObject.beginTime.substring(2,4))+
                     ` | Hora Fin->  ` +(horarioItemObject.endTime.substring(0,2) +":" + horarioItemObject.endTime.substring(2,4))+
                      ` | Sede: `+horarioItemObject.campus +
                      ` | Edificio: `+horarioItemObject.building+
                      ` | Salon: `+horarioItemObject.room+`</a>`;
    
                    itemsHorarios += horario;
                }
                itemsHorarios += `</div>`;
            }

             //Se pone check los checkbox de las materias que ya estan almacenadas                
            var checkedInStorage = materiaInStorage(clase.id) ? "checked" : "";
            var materia = [
                `<div class="ui toggle checkbox saveMateria">
                    <input type="checkbox" name="public" value="`+clase.id+`" `+checkedInStorage+`>
                    <label></label>
                </div>
                `,
                clase.courseTitle,
                clase.courseReferenceNumber,
                clase.creditHourLow,
                itemsHorarios,
                clase.subjectDescription
    
            ];
            data.push(materia);
        }

        return data;

    }


    




    /**
     * Funciones del Storage
     */
    var keyStorage = "inscripcionesU_Materiaas";        
    function getStorageMaterias(){

        
        return !localStorage.getItem(keyStorage) ? [] : JSON.parse(localStorage.getItem(keyStorage));
    }

    function guardarMateria(materia)
    {
        var materiasStorage = getStorageMaterias();

        console.log(materiasStorage);
        console.log(materia);
        materiasStorage.push(materia);

        localStorage.setItem(keyStorage,JSON.stringify(materiasStorage));

    }

    function materiaInStorage(idMateria)
    {
        var res = alasql("SELECT * id FROM ? WHERE id = " + idMateria,[getStorageMaterias()]);

        return res.length > 0;
    }
    
   
    
});

