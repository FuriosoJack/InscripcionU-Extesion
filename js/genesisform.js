
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
            <th>#</th>
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
</div>
<div class="notification-center-flyout"></div>
`;
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
                                                materiasCurrent = respuesta.data;
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
                                        buildTableDatatables(respuesta.data);
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
                `<div class="ui toggle checkbox ">
                    <input type="checkbox" class="saveMateria" name="public" value="`+clase.id+`" `+checkedInStorage+`>
                    <label></label>
                </div>
                `,
                clase.id,
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

    $(document).on('change',".saveMateria",function(element)
        {


            if(this.checked){
                var res = alasql('SELECT * FROM ? WHERE id = '+$(this).val() ,[materiasCurrent]);                
                //Si hay un resultado se guarda
                if(res.length > 0){
                    console.log(res[0]);
                    console.log("guardar");
    
                    guardarMateria(res[0]);
                }else{
                    console.error("no existe coincidencias para guardar materia");
                }
            }else{
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

    var grillasDeHorarios = [
        getNuevaGrilla()
    ];



    function calcularHorario()
    {
        console.log("///////////////////////Calculo de horario");
        var clases = getStorageMaterias();

        
        loop1:
        for(i = 0; i < clases.length; i++){
            var clase = clases[i];
            console.log("Clase:" + clase.id);
            var grillaActualMisma = -1;
            var todosLosHorariosEnMismaGrilla = true;
            //Verificar si todos los horarios pueden estar en la misma grilla
            //Si no se crea otra grilla 
            loop2:
            for(o = 0; o < clase.meetingsFaculty.length; o++){

                var horario = clase.meetingsFaculty[o];
                var horaInicioInt = parseInt(horario.meetingTime.beginTime);
                var horaFinInt = parseInt(horario.meetingTime.endTime);
                var dateInicio = new Date(horario.meetingTime.startDate + " " + getHoraHumano(horario.meetingTime.beginTime)+ ":00");
                var dateFin = new Date(horario.meetingTime.startDate  + " " + getHoraHumano(horario.meetingTime.endTime) + ":00");
                var diffMillis = (dateFin - dateInicio);
                var difftotal_seconds = parseInt(Math.floor(diffMillis / 1000));
                var tamañoHorario = parseInt(Math.floor(difftotal_seconds / 60));
                var posicionX = calcularDia(horario)["value"] - 1 ;
                console.log("date a format->" + horario.meetingTime.startDate + " " + getHoraHumano(horario.meetingTime.beginTime)+ ":00");
                console.log("Date inicio:" + dateInicio);
                console.log("Date fin:" + dateFin);
                console.log("Date diff:" + diffMillis);
                console.log("Date diff:" + tamañoHorario);
                
                
                loop3:
                for(x = 0; x < grillasDeHorarios.length; x++){
                    var grillaActual = grillasDeHorarios[x];   
                    //POSICIONES Y del horario
                    loop4:
                    for( p = 0; p <= tamañoHorario; p++){
                        var dateInicio = new Date(horario.meetingTime.startDate + " " + getHoraHumano(horario.meetingTime.beginTime) + ":00");
                        var newDateInicio = new Date(dateInicio);
                        newDateInicio.setMinutes( dateInicio.getMinutes() + p);
                        var seconds = newDateInicio.getMinutes() == 0 ? "00" : newDateInicio.getMinutes();
                        var posicionY = calcularPosicionYPorHora(parseInt(newDateInicio.getHours()+""+seconds));      
                        
                        console.log("--------------------MIma grilla");
                                
                        console.log("x: " + posicionX + " y: "+posicionY  + " grilla:" + x);
                        console.log("new Hours:" + newDateInicio.getHours());
                        console.log("new secons:" + newDateInicio.getMinutes());
                        console.log("Hora p+:" + p);
                        console.log("--------------------");
                        if(grillaActual[posicionX][posicionY] === undefined){

                            if(grillaActualMisma != -1 && grillaActualMisma != x){
                                console.log("siguiente grilla");
                                
                                console.log("x: " + posicionX + " y: "+posicionY  + " grilla:" + x);
                                console.log("Hora INicio:" + horaInicioInt);
                                console.log("Hora fin:" + horaFinInt);
                                console.log("Hora p+:" + p);
                                todosLosHorariosEnMismaGrilla = false;
                                break loop2;
                            }else{
                                grillaActualMisma = x;
                            }                           
                        }else{
                            console.log("siguiente grilla");
                            console.log("x: " + posicionX + " y: "+posicionY  + " grilla:" + x);
                            console.log("Hora INicio:" + horaInicioInt);
                            console.log("Hora fin:" + horaFinInt);
                            console.log("Hora p+:" + p);
                            todosLosHorariosEnMismaGrilla = false;
                            break loop2; 
                           
                            
                        }
                    } 
                    //Si llego al final de horario y todo estan en la mima grilla pero si es diferente de -1 sale del recorrido de grillas
                    if(todosLosHorariosEnMismaGrilla && grillaActual != -1){
                        break loop3;
                    }
                    
                }
            }  
            console.log("GrillaActualMima: "+ grillaActualMisma);
            console.log("TodosENlamiamgrilla: "+ todosLosHorariosEnMismaGrilla);
            console.log("Horario:");
            console.log(clase.meetingsFaculty);
            console.log("Grillas Antesde revisar si se crea o se añade");
            console.log(JSON.stringify(grillasDeHorarios));
            //Si todos los horario entran en la misma grilla se añaden
           //si no se crea otra y añaden
            if(todosLosHorariosEnMismaGrilla){
                for(o = 0; o < clase.meetingsFaculty.length; o++){
                    var horario = clase.meetingsFaculty[o];
                    var horaInicioInt = parseInt(horario.meetingTime.beginTime);
                    var horaFinInt = parseInt(horario.meetingTime.endTime);
                    var dateInicio = new Date(horario.meetingTime.startDate + " " + getHoraHumano(horario.meetingTime.beginTime)+ ":00");
                    var dateFin = new Date(horario.meetingTime.startDate  + " " + getHoraHumano(horario.meetingTime.endTime) + ":00");
                    var diffMillis = (dateFin - dateInicio);
                    var difftotal_seconds = parseInt(Math.floor(diffMillis / 1000));
                    var tamañoHorario = parseInt(Math.floor(difftotal_seconds / 60));;
                    var posicionX = calcularDia(horario)["value"] - 1 ;
                    
                    for( p = 0; p <= tamañoHorario; p++){
                        var dateInicio = new Date(horario.meetingTime.startDate + " " + getHoraHumano(horario.meetingTime.beginTime) + ":00");
                        var newDateInicio = new Date(dateInicio);
                        newDateInicio.setMinutes( dateInicio.getMinutes() + p);
                        var seconds = newDateInicio.getMinutes() == 0 ? "00" :  (newDateInicio.getMinutes() < 10 ? "0" + newDateInicio.getMinutes() : newDateInicio.getMinutes());
                        var posicionY = calcularPosicionYPorHora(parseInt(newDateInicio.getHours()+""+seconds));     

                        //añaden los horarios
                        grillasDeHorarios[grillaActualMisma][posicionX][posicionY] = clase.id;
                    }
                }
            }else{
                //Se crea una grilla y se añaden los horarios y luego se añade la lista de grillas
                var newGrilla = getNuevaGrilla();
                for(o = 0; o < clase.meetingsFaculty.length; o++){
                    var horario = clase.meetingsFaculty[o];
                    var horaInicioInt = parseInt(horario.meetingTime.beginTime);
                    var horaFinInt = parseInt(horario.meetingTime.endTime);
                    var dateInicio = new Date(horario.meetingTime.startDate + " " + getHoraHumano(horario.meetingTime.beginTime)+ ":00");
                    var dateFin = new Date(horario.meetingTime.startDate  + " " + getHoraHumano(horario.meetingTime.endTime) + ":00");
                    var diffMillis = (dateFin - dateInicio);
                    var difftotal_seconds = parseInt(Math.floor(diffMillis / 1000));
                    var tamañoHorario = parseInt(Math.floor(difftotal_seconds / 60));;
                    var posicionX = calcularDia(horario)["value"] - 1 ;
                    for( p = 0; p <= tamañoHorario; p++){
                        var dateInicio = new Date(horario.meetingTime.startDate + " " + getHoraHumano(horario.meetingTime.beginTime) + ":00");
                        var newDateInicio = new Date(dateInicio);
                        newDateInicio.setMinutes( dateInicio.getMinutes() + p);
                        var seconds = newDateInicio.getMinutes() == 0 ? "00" :  (newDateInicio.getMinutes() < 10 ? "0" + newDateInicio.getMinutes() : newDateInicio.getMinutes());
                        var posicionY = calcularPosicionYPorHora(parseInt(newDateInicio.getHours()+""+seconds));    

                        //añaden los horarios
                        newGrilla[posicionX][posicionY] = clase.id;
                    }
                }

                grillasDeHorarios.push(newGrilla);

            }
            console.log("Grillas antes de salid de clase");
            console.log(JSON.stringify(grillasDeHorarios));

        }

       
    }


    function getHoraHumano(horaInt)
    {
        return horaInt.substring(0,2) +":" + horaInt.substring(2,4);
    }
    function traducirGrilla(grilla)
    {


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

