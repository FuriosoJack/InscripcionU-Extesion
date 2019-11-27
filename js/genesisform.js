$("html").html("");

var gridBasic = `
<div class="ui fixed inverted main menu">
  <a class="item right" title="Ayuda">   
    ?    
  </a>
</div>
<div class="ui internally celled grid">
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
        <div class="field right">
             <div class="ui buttons">                
                <button class="ui yellow button" disabled id="buscarClases">Buscar</button>               
            </div>
        </div>
    </form>
  </div>
  <div class="twelve wide column">
  <div class="ui dimmer"  id="loadingSearchMaterias">
    <div class="ui indeterminate text loader">Cargando Materias</div>
  </div>
    <table class="ui selectable inverted table" id="tableHorarios">
        <thead>
            <tr>
            <th>Seleccionar</th>
            <th>#</th>
            <th>Nombre</th>
            <th>NRC</th>
            <th>Creditos</th>
            <th>Horarios</th>
			<th>Curso</th>
            <th>Programa</th>
            </tr>
        </thead>
        <tbody>
            
        </tbody>
        </table>
  </div>
</div>
<div class="row">
  <div class="sixteen wide column" id="tablasHorarios">
    <img>
  </div>  
</div>
</div>
<div class="notification-center-flyout"></div>
`;
$("body").append(gridBasic);
$("head").append("<title>InscripcionesU</title>");

var periodoCurrent;
var programaCurrent;
var materiasCurrent;

$(document).ready(function() {

    // tableHorarios = $("#tableHorarios").DataTable();
    

    //inicializar Dropdown Filrtros dias

    $("#filtroDiasSemana").dropdown();

    $(".popool").popup({
        inline: true
      });



      


    $("#buscarClases").click(function(e){

        e.preventDefault();
        

        var button = $(this);
        var value = $("#selectProgramas").dropdown("get value");
        var codePeriodo = $(this).attr("codePeriodo");

        if(value != ""){

            //Mostrar loading
            $("#loadingSearchMaterias").dimmer({closable:false}).dimmer("show");
            programaCurrent = value;


            //Verificar si toca resetear la seleccion
            button.prop("disabled",true);
            if ($("#selectProgramas").find(".text").html() != "") {
                $.ajax({
                    url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/classSearch/resetDataForm',
                    type: 'POST',
                    success: function(respuesta) {
                        $.ajax({
                            url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subject=' + value + '&txt_term=' + codePeriodo + '&startDatepicker=&endDatepicker=&pageOffset=0&pageMaxSize=10000&sortColumn=subjectDescription&sortDirection=asc',
                            success: function(respuesta) {
                                if (respuesta.success) {                                                
                                    materiasCurrent = respuesta.data;
                                    if(materiasCurrent !== undefined){
                                        buildTableDatatables(materiasCurrent);
                                    }
                                
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
                    complete: function() {
                        
                    }
                });
            } else {
                $.ajax({
                    url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subject=' + value + '&txt_term=' + codePeriodo + '&startDatepicker=&endDatepicker=&pageOffset=0&pageMaxSize=10000&sortColumn=subjectDescription&sortDirection=asc',
                    success: function(respuesta) {
                        if (respuesta.success && !respuesta.isNull("data")) {
                            materiasCurrent = respuesta.data;
                            buildTableDatatables(respuesta.data);
                        }
                    },
                    error: function() {
                        console.log("No se ha podido obtener la información");
                    },
                    complete: function() {
                       
                    }
                });
            }
        }else{
            alert("Selecione un Programa");
        }     

    });


    $("#limpiarBusqueda").click(function(e){
        e.preventDefault();
        
        inicializarBotonBuscar();
        inicializarSelectProgramas();
        $("#tableHorarios").DataTable({
            data: [],
            destroy: true,
            processing: true,
            scrollY: "60vh",
        });


    });


    llamarListaDePeriodos();



    function llamarListaDePeriodos()
    {
        //Poner La lista de periodos
        $.ajax({
            url: 'https://genesiscursos.uniminuto.edu/StudentRegistrationSsb/ssb/classSearch/getTerms?searchTerm=&offset=1&max=1000',
            type: 'GET',
            success: function(respuesta) {

                for (var i = 0; i < respuesta.length; i++) {
                    $("#selectPeriodo").append('<option value="' + respuesta[i].code + '">' + respuesta[i].description + '</option>');
                }


                $("#selectPeriodo").dropdown({
                    onChange: function(value, text, $choice) {


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
                $("#selectProgramas").dropdown();

                $("#selectProgramas").addClass("success");
                $("#buscarClases").prop("disabled",false);
                $("#buscarClases").attr("codePeriodo",codePeriodo)


            },
            error: function() {
                console.log("No se ha podido obtener la información");
            }
        });
    }

    function inicializarSelectProgramas() {
        $('#selectProgramas').dropdown('destroy');
        $("#selectProgramas").find(".item").remove();
        $("#selectProgramas").find("input[type='hidden']").val("");
        $("#selectProgramas").find(".text").html("Seleccione Programa");
        $("#selectProgramas").find(".text").addClass("default");
        $("#selectProgramas").removeClass("success");
    }

    function inicializarSelectPeriodo()
    {
        $('#selectPeriodo').dropdown('destroy');
        llamarListaDePeriodos();


    }

    function inicializarBotonBuscar()
    {
        $("#buscarClases").prop("disabled",true);
        $("#buscarClases").attr("codePeriodo","")

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
        $("#buscarClases").prop("disabled",false);






    }


    function buildTableHorarios(clases) {

        var data = buildJsonMaterias(clases);
        var tbody = $("#tableHorarios").find("tbody");
        tbody.html("");

        for (var i = 0; i < data.length; i++) {

            tbody.append(`
                <tr>
                <td>` + data[i][0] + `</td>
                    <td>` + data[i][1] + `</td>
                    <td>` + data[i][2] + `</td>
                    <td>` + data[i][3] + `</td>
                    <td>` + data[i][4] + `</td>
					<td>` + data[i][5] + `</td>
                </tr>
            `);
        }


    }


    function buildJsonMaterias(clases) {

        var data = [];
        for (var i = 0; i < clases.length; i++) {

            var clase = clases[i];
            var horariosObject = clase.meetingsFaculty;


           
            if (horariosObject.length > 0) {


                var sinDia = false;
                var  itemsHorarios = `<div class="ui horizontal inverted bulleted link list"><a class="item"></a>`;

              
                for (var y = 0; y < horariosObject.length; y++) {

                    var horarioObject = horariosObject[y];
                    var horarioItemObject = horarioObject.meetingTime;
                    var diaHumano  = calcularDia(horarioObject);                    
                    if(diaHumano["value"] == -1){
                        sinDia = true;
                        break;
                    }
                    console.log(horarioItemObject);

                    try{
                        var horario = ` <a class="item">Dia: ` + diaHumano["name"] +
                        ` | Hora Inicio-> ` +
                        getHoraHumano(horarioItemObject.beginTime) +
                        ` | Hora Fin->  ` + getHoraHumano(horarioItemObject.endTime) +
                        ` | Sede: ` + horarioItemObject.campus +
                        ` | Edificio: ` + horarioItemObject.building +
                        ` | Salon: ` + horarioItemObject.room + `</a>`;
                    }
                    catch(error){
                        //Si ocurre error posiblemente es por que no tien hora de salida o de entrada
                        console.error(error);
                        sinDia = true;
                        //Nos salimos del dia para que no se tenga en cuenta en la tabla
                        break;
                    }                  

                    itemsHorarios += horario;
                }


                itemsHorarios += `</div>`;

                 //Se pone check los checkbox de las materias que ya estan almacenadas                
                var checkedInStorage = materiaInStorage(clase.id) ? "checked" : "";
                var materia = [
                    `<div class="ui toggle checkbox ">
                        <input type="checkbox" class="saveMateria" name="public" value="` + clase.id + `" ` + checkedInStorage + `>
                        <label></label>
                    </div>
                    `,
                    clase.id,
                    clase.courseTitle,
                    clase.courseReferenceNumber,
                    clase.creditHourLow,
                    itemsHorarios,
                    clase.courseNumber,
                    clase.subjectDescription

                ];
                //SOlo se ingresen los dias que tiene dia
                if(!sinDia){
                    data.push(materia);
                }
                
            }

           
        }

        return data;

    }


    $("#calcularHorario").click(function(event) {
        event.preventDefault();
        calcularHorario();
        return false;
    });

    $(document).on('change', ".saveMateria", function(element) {


        if (this.checked) {
            var res = alasql('SELECT * FROM ? WHERE id = ' + $(this).val(), [materiasCurrent]);
            //Si hay un resultado se guarda
            if (res.length > 0) {
                console.log(res[0]);
                console.log("guardar");

                guardarMateria(res[0]);
            } else {
                console.error("no existe coincidencias para guardar materia");
            }
        } else {
            eliminarMateriaOfStorage($(this).val());
        }



    });


    /**
     * Funciones Adicionales 
     * 
     */

    $("head").append("<title>InscripcionesU</title>");

    message = "Calculo de Horarios🚀 ";

    function step() {
        message = message.substr(1) + message.substr(0, 1);
        document.title = message.substr(0, 15);

    }

    setInterval(step, 100);


    //************************************ */

    /**
     * Funciones del Storage
     */
    var keyStorage = "inscripcionesU_Materiaas";

    function getStorageMaterias() {
        return !localStorage.getItem(keyStorage) ? [] : JSON.parse(localStorage.getItem(keyStorage));
    }



    function guardarMaterias(materias) {
        localStorage.setItem(keyStorage, JSON.stringify(materias));
    }

    function guardarMateria(materia) {
        var materiasStorage = getStorageMaterias();
        //orgenar array 

        console.log(materiasStorage);
        console.log(materia);
        materiasStorage.push(materia);
        materiasStorage.sort(function(a,b){
            if(a.creditHourLow < b.creditHourLow){
                return -1;
            }
            if(a.creditHourLow > b.creditHourLow){
                return 1;
            }

            return 0;

            
        });
        guardarMaterias(materiasStorage);

    }

    function eliminarMateriaOfStorage(idMateria) {
        guardarMaterias(getStorageMaterias().filter(function(materia) {
            return idMateria != materia.id
        }));

    }

    function getMateriaInStorage(idMateria) {
        return alasql("SELECT * id FROM ? WHERE id = " + idMateria, [getStorageMaterias()]);
    }

    function getMateriaInStorageNRC(idMateria, nrc) {
        return alasql("SELECT * FROM ? WHERE id = " + idMateria + " AND courseReferenceNumber = " + nrc, [getStorageMaterias()]);
    }

    function getMateriaInStorageCurso(idMateria, curso) {
        return alasql("SELECT * FROM ? WHERE id = " + idMateria + " AND courseNumber = " + curso, [getStorageMaterias()]);
    }

    function materiaInStorage(idMateria) {
        return getMateriaInStorage(idMateria).length > 0;
    }





 


    function claseCaveEnGrilla(clase,grillaActual)
    {
        for (iHorario = 0; iHorario < clase.meetingsFaculty.length; iHorario++) {
            var horario = clase.meetingsFaculty[iHorario];
            var tamañoHorario = calcularNminutosentreFechas(horario.meetingTime);
            var posicionX = calcularDia(horario)["value"] - 1;
            for (iMinuto = 0; iMinuto <= tamañoHorario; iMinuto++) {
                var dateInicio = new Date(horario.meetingTime.startDate + " " + getHoraHumano(horario.meetingTime.beginTime) + ":00");
                var newDateInicio = new Date(dateInicio);
                newDateInicio.setMinutes(dateInicio.getMinutes() + iMinuto);
                var seconds = newDateInicio.getMinutes() <= 9 ? "0" + newDateInicio.getMinutes() : newDateInicio.getMinutes();
                var posicionY = calcularPosicionYPorHora(parseInt(newDateInicio.getHours() + "" + seconds));
             //   console.log("x:" + posicionX + "y:" + posicionY);
                if (grillaActual[posicionX][posicionY] !== undefined) {   
                    
                    console.log(grillaActual[posicionX][posicionY]);
                    console.log("NO pasa");
                    return false;
                }
            }
        }
        return true;
    }

     

    function cursoYaEnGrilla(curso,grilla)
    {

        
        for(pgrilla =0; pgrilla < grilla.length; pgrilla++){           
            
            if(grilla[pgrilla]["programa"] == curso["programa"] && grilla[pgrilla]["id"] != curso["id"]){
                if(grilla[pgrilla]["id"] != curso["id"]){
                    console.log(grilla[pgrilla]["id"]);
                    
                    console.log(curso["id"]);
                    return 1; //no es la mima materia
                }else{
                    return 2; //es la mima materia
                }                
            }
        }
        
        return 0; // no esta 

    }
    function calcularHorario() {
        var grillasDeHorarios = [
        ];

        var cursosGrillas = [
        ];

        var creditosGrillas = [

        ];

        

        console.log("///////////////////////Calculo de horario");
        var clases = getStorageMaterias();


            
            for (i = 0; i < clases.length; i++) {
                var clase = clases[i];
                console.log("Clase:" + clase.id);
                var grillaSeleccionada = -1;

                //Se comprueba si se puede en una grilla o se crea una nueva
                for (x = 0; x < grillasDeHorarios.length; x++) {
                    //console.log("x:" + x);
                    var grillaActual = grillasDeHorarios[x];
                    var cursoEnGrilla =cursoYaEnGrilla({"id":clase.id,"programa": clase.courseNumber},cursosGrillas[x]);
                    if((cursoEnGrilla == 0 || cursoEnGrilla == 2) && claseCaveEnGrilla(clase,grillaActual) && creditosGrillas[x] < 18){      
                       if(cursoEnGrilla == 0){
                            console.log("ubacaion grilla:");
                           console.log(x);
                           console.log(cursosGrillas);
                           cursosGrillas[x].push({"id":clase.id,"programa": clase.courseNumber});
                       }                  
                       grillaSeleccionada = x;
                       creditosGrillas[x] = creditosGrillas[x] + parseInt(clase.creditHourLow);
                       break;
                    }
                }

                if(grillaSeleccionada == -1){
                    var newGrilla = getNuevaGrilla();
                    for (z = 0; z < clase.meetingsFaculty.length; z++) {
                        var horario = clase.meetingsFaculty[z];
                        var tamañoHorario = calcularNminutosentreFechas(horario.meetingTime);
                        var posicionX = calcularDia(horario)["value"] - 1;
                        for (c = 0; c <= tamañoHorario; c++) {
                                    var dateInicio = new Date(horario.meetingTime.startDate + " " + getHoraHumano(horario.meetingTime.beginTime) + ":00");
                                    var newDateInicio = new Date(dateInicio);
                                    newDateInicio.setMinutes(dateInicio.getMinutes() + c);
                                    var seconds = newDateInicio.getMinutes() <= 9 ? "0" + newDateInicio.getMinutes() : newDateInicio.getMinutes();
                                    var posicionY = calcularPosicionYPorHora(parseInt(newDateInicio.getHours() + "" + seconds));
                                   
                                    newGrilla[posicionX][posicionY] = clase.id;
                        }
                        
                    }

                    grillasDeHorarios.push(newGrilla);
                    cursosGrillas.push([{"id":clase.id,"programa": clase.courseNumber}]);
                    creditosGrillas.push(parseInt(clase.creditHourLow));
                }else{
                    for (o = 0; o < clase.meetingsFaculty.length; o++) {
                        //console.log("o:" + o);
                        var horario = clase.meetingsFaculty[o];
                        var tamañoHorario = calcularNminutosentreFechas(horario.meetingTime);
                        var posicionX = calcularDia(horario)["value"] - 1;
                        for (p = 0; p <= tamañoHorario; p++) {
                            var dateInicio = new Date(horario.meetingTime.startDate + " " + getHoraHumano(horario.meetingTime.beginTime) + ":00");
                            var newDateInicio = new Date(dateInicio);
                            newDateInicio.setMinutes(dateInicio.getMinutes() + p);
                            var seconds = newDateInicio.getMinutes() <= 9 ? "0" + newDateInicio.getMinutes() : newDateInicio.getMinutes();
                            var posicionY = calcularPosicionYPorHora(parseInt(newDateInicio.getHours() + "" + seconds));
                          
                            grillasDeHorarios[grillaSeleccionada][posicionX][posicionY] = clase.id;
                        }
                    }
                }              



             
                console.log("Horario:");
                console.log(clase.meetingsFaculty);
                //console.log("Grillas Antesde revisar si se crea o se añade");
               //console.log(JSON.stringify(grillasDeHorarios));             
                
                
                }
                
            console.log("Grillas terminadas");
            console.log(JSON.stringify(grillasDeHorarios));
        buildTableHorarios(grillasDeHorarios,creditosGrillas);
        console.log("Grillas cursos");
        console.log(cursosGrillas);

        console.log("Grillas Creditos");
        console.log(creditosGrillas);





    }


    function calcularNminutosentreFechas(meetingTime) {
        var dateInicio = new Date(meetingTime.startDate + " " + getHoraHumano(meetingTime.beginTime) + ":00");
        var dateFin = new Date(meetingTime.startDate + " " + getHoraHumano(meetingTime.endTime) + ":00");
        var diffMillis = (dateFin - dateInicio);
        var difftotal_seconds = parseInt(Math.floor(diffMillis / 1000));
        var total = parseInt(Math.floor(difftotal_seconds / 60));
        return total;
    }

    function buildTableHorarios(grillas,creditosGrillas) {
        var grillasFiltradas = [];
        var totalTables = "";
        for (i = 0; i < grillas.length; i++) {
            var grillaActual = grillas[i];
            var grilla = [];
            var tableHTML = "<table class='ui celled striped table'><thead><tr><th>Dia</th><th>Hora Inicio</th><th>Hora Fin</th><th>Materia</th><th>NRC</th><th>Curso</th><th>Creditos</th><th>ID</th></tr></thead><tbody>";
            //Recorrido de dias de la semana
            
            for (o = 0; o < grillaActual.length; o++) {
                var diaFiltrado = Array.from(new Set(grillaActual[o]));

                

                //recorrido de dias de la frilla
                for (p = 0; p < diaFiltrado.length; p++) {

                    if (diaFiltrado[p] !== undefined) {
                        tableHTML += "<tr>";
                        var materia = getMateriaInStorage(diaFiltrado[p])[0];
                        var diaSemana = calcularDiaSemanaPorPosicion(o + 1);
                        console.log(diaFiltrado[p])
                        console.log(materia);
                        console.log(diaSemana["name"]);
                        var horario = alasql("SELECT * FROM ? as data where data.meetingTime." + diaSemana["value"] + " = true", [materia.meetingsFaculty])[0];
                        console.log("Hoario");
                        console.log(horario);

                        tableHTML += "<td>" + diaSemana["name"] + "</td>";
                        tableHTML += "<td>" + (horario.meetingTime.beginTime.substring(0, 2) + ":" + horario.meetingTime.beginTime.substring(2, 4)) + "</td>";
                        tableHTML += "<td>" + (horario.meetingTime.endTime.substring(0, 2) + ":" + horario.meetingTime.endTime.substring(2, 4)) + "</td>";
                        tableHTML += "<td>" + materia.courseTitle + "</td>";
                        tableHTML += "<td>" + materia.courseReferenceNumber + "</td>";
                        tableHTML += "<td>" + materia.courseNumber + "</td>";
                        tableHTML += "<td>" + materia.creditHourLow + "</td>";
                        tableHTML += "<td>" + materia.id + "</td>";
                        tableHTML += "<tr>";
                       

                    }
                }

                
                tableHTML += "</tr>";



                grilla.push(diaFiltrado);
            }
            tableHTML += "</tbody><tfoot class='full-width'><tr><th colspan='6'>Total Creditos</th><th colspan='2'>"+creditosGrillas[i]+"</th></tr></tfoot>"
            tableHTML += "</table>";
            totalTables += tableHTML;
            grillasFiltradas.push(grilla);
        }

        console.log(totalTables);



        console.log("Grillas FIltradas");
        console.log(JSON.stringify(grillasFiltradas));

        $("#tablasHorarios").html("");
        $("#tablasHorarios").html(totalTables);



    }







    function getHoraHumano(horaInt) {
        return horaInt.substring(0, 2) + ":" + horaInt.substring(2, 4);
    }


    function getNuevaGrilla() {

        var tamañoX = 7;
        var tamañoY = 960;
        var grillaHorarios = Array(tamañoX);

        for (x = 0; x < tamañoX; x++) {
            grillaHorarios[x] = new Array(tamañoY);
        }
        return grillaHorarios;
    }


    function calcularDia(horario) {
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
        } else {
            return {
                name: "NO ASIGNADO",
                value: -1
            };
        }

    }

    function calcularDiaSemanaPorPosicion(posicion) {
        //alasql("select * from ? as data where data.meetingTime.tuesday = true ",[select1[0].meetingsFaculty])
        //var select1 = alasql("select datos.meetingsFaculty from ? as datos where datos.id = 878136", [dataa])

        var data;
        switch (posicion) {
            case 5:
                data = {
                    name: "Viernes",
                    value: "friday"
                };
                break;
            case 1:
                data = {
                    name: "Lunes",
                    value: "monday"
                };
                break;
            case 2:
                data = {
                    name: "Martes",
                    value: "tuesday"
                };
                break;
            case 3:
                data = {
                    name: "Miercoles",
                    value: "wednesday"
                };
                break;
            case 4:
                data = {
                    name: "Jueves",
                    value: "thursday"
                };
                break;
            case 6:
                data = {
                    name: "Sabado",
                    value: "saturday"
                };
                break;
            case 7:
                data = {
                    name: "Domingo",
                    value: "sunday"
                };
                break

            default:
                data = {
                    name: "NO ASIGNADO",
                    value: "NO ASIGNADO"
                };
        }

        return data;


    }

    /**
     * 
     * @param {*} hora 
     */
    function calcularPosicionYPorHora(hora) {
        var horaInt = parseInt(hora);
        /*        
            
            var parteFaltante = horaInt % 100;
            var n60 = ((horaInt - parteFaltante)/100)-5;
            var valorPosicion = parteFaltante/60;
            var numeroQuedaPosicion = valorPosicion + n60;
            return 60 * numeroQuedaPosicion;
            */

        return Math.round(60 * ((((horaInt - (horaInt % 100)) * 0.01) - 6) + ((horaInt % 100) / 60)));


    }

    function calcularHoraPorPosicionY(posicionY) {
        /*var numeroQuedaPosicion = posicionX/60;        
        var valorPosicion = numeroQuedaPosicion % 1;
        var n60 = numeroQuedaPosicion - valorPosicion;
        var parteFaltante = valorPosicion * 60;
        var horaInt = ((n60+5)*100)+parteFaltante;*/

        return ((((posicionY / 60) - ((posicionY / 60) % 1)) + 6) * 100) + (((posicionY / 60) % 1) * 60);



    }










});