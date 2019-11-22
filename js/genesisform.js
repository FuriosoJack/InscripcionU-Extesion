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
        <div class="field">
            <button type="button" class="ui yellow button" id="calcularHorario">Generar</button>
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
$("head").append("<title>InscripcionesU</title>");

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
                eliminarMateriaOfStorage($(this).val());
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
                    
                    var horario = ` <a class="item">Dia: ` + calcularDia(horarioObject)["name"] + 
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


    $("#calcularHorario").click(function(event){
        event.preventDefault();    
        calcularHorario();
        return false;
    });

    


    /**
     * Funciones Adicionales 
     * 
     */

    $("head").append("<title>InscripcionesU</title>");

    message = "Calculo de Horarios🚀 ";
	function step() {
			message = message.substr(1) + message.substr(0,1);
            document.title = message.substr(0,15);
            
    }

    setInterval(step,100);  


    //************************************ */

    /**
     * Funciones del Storage
     */
    var keyStorage = "inscripcionesU_Materiaas";        
    function getStorageMaterias(){        
        return !localStorage.getItem(keyStorage) ? [] : JSON.parse(localStorage.getItem(keyStorage));
    }

    function guardarMaterias(materias)
    {
        localStorage.setItem(keyStorage,JSON.stringify(materias));
    }
    function guardarMateria(materia)
    {
        var materiasStorage = getStorageMaterias();

        console.log(materiasStorage);
        console.log(materia);
        materiasStorage.push(materia);

        guardarMaterias(materiasStorage);

    }

    function eliminarMateriaOfStorage(idMateria)
    {                
        guardarMaterias(getStorageMaterias().filter(function(materia){
            return idMateria != materia.id
        }));               
        
    }
    
    function materiaInStorage(idMateria)
    {
        return alasql("SELECT * id FROM ? WHERE id = " + idMateria,[getStorageMaterias()]).length > 0;
    }


    
   
    /**
     * Calculo de horarios
     */

    var grillasDeHorarios = [];



    function calcularHorario()
    {
        var clases = getStorageMaterias();
        for(i = 0; i < clases.length; i++){
            var clase = clases[i];
            for(o = 0; o < clase.meetingsFaculty.length; o++){
                var horario = clase.meetingsFaculty[o];

                var horaInicioInt = parseInt(horario.meetingTime.beginTime);
                var horaFinInt = parseInt(horario.meetingTime.endTime);
                var tamañoHorario = horaFinInt - horaInicioInt;
                var posicionX = calcularDia(horario)["value"] - 1 ;
                for( p = 0; p <= tamañoHorario; p++){
                    añadirClaseAGrilla(clase.id,posicionX,calcularPosicionYPorHora(horaInicioInt+p));
                }


            }        

        }

        console.log(JSON.stringify(grillasDeHorarios));
    }

    function añadirClaseAGrilla(idClase,x,y)
    {
        
        if(grillasDeHorarios.length == 0){
            grillasDeHorarios.push(getNuevaGrilla());
        }
        
        
        for(i = 0; i < grillasDeHorarios.length; i++){
            var grillaActual = grillasDeHorarios[i];
            console.log(grillaActual);
            if(grillaActual[x][y] === undefined){
                grillaActual[x][y] = idClase;
            }
        }       
    }

    function getNuevaGrilla()
    {

        var tamañoX = 7;
        var tamañoY = 1020;
        var grillaHorarios = Array(tamañoX);    
        
        for(x = 0; x < tamañoX;x++){
            grillaHorarios[x] =  new Array(tamañoY);            
        }
        return grillaHorarios;
    }
    
    
    function calcularDia(horario)
    {
        var detail = horario.meetingTime;

        if (detail.friday) {
            return {
                name: "Viernes",
                value: 5            
            };
        } else if (detail.monday) {
            return {
                name: "Lunes",
                value: 1            
            };
        } else if (detail.saturday) {
            return {
                name: "Sabado",
                value: 6        
            };            
        } else if (detail.sunday) {
            return {
                name: "Domingo",
                value: 7      
            };            
        } else if (detail.thursday) {
            return {
                name: "Jueves",
                value: 4      
            };     
        } else if (detail.tuesday) {
            return {
                name: "Martes",
                value: 2    
            };   
        } else if (detail.wednesday) {
            
            return {
                name: "Miercoles",
                value: 3     
            };   
        }else{
            return {
                name: "NO ASIGNADO",
                value: -1     
            };  
        }

    }

    /**
     * 
     * @param {*} hora 
     */
    function calcularPosicionYPorHora(hora)
    {    
        var horaInt = parseInt(hora);
    /*        
        
        var parteFaltante = horaInt % 100;
        var n60 = ((horaInt - parteFaltante)/100)-5;
        var valorPosicion = parteFaltante/60;
        var numeroQuedaPosicion = valorPosicion + n60;
        return 60 * numeroQuedaPosicion;
        */

        return Math.round(60*((((horaInt-(horaInt%100))*0.01)-5)+((horaInt%100)/60)));


    }
    

    




    
});

