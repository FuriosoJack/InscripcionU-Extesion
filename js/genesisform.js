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

$(document).ready(function() {

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

                    }
                });

                $("#selectProgramas").addClass("success");


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


            var itemsHorarios = "Sin Horarios";
            if (horariosObject.length > 0) {


                itemsHorarios = `<div class="ui horizontal bulleted link list"><a class="item"></a>`;


                for (var y = 0; y < horariosObject.length; y++) {

                    var horarioObject = horariosObject[y];
                    var horarioItemObject = horarioObject.meetingTime;
                    console.log(horarioItemObject);
                    var horario = ` <a class="item">Dia: ` + calcularDia(horarioObject)["name"] +
                        ` | Hora Inicio-> ` +
                        (horarioItemObject.beginTime.substring(0, 2) + ":" + horarioItemObject.beginTime.substring(2, 4)) +
                        ` | Hora Fin->  ` + (horarioItemObject.endTime.substring(0, 2) + ":" + horarioItemObject.endTime.substring(2, 4)) +
                        ` | Sede: ` + horarioItemObject.campus +
                        ` | Edificio: ` + horarioItemObject.building +
                        ` | Salon: ` + horarioItemObject.room + `</a>`;

                    itemsHorarios += horario;
                }
                itemsHorarios += `</div>`;
            }

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
            data.push(materia);
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

        console.log(materiasStorage);
        console.log(materia);
        materiasStorage.push(materia);

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







    function calcularHorario() {
        var grillasDeHorarios = [
            getNuevaGrilla()
        ];

        var cursosGrillas = [];

        console.log("///////////////////////Calculo de horario");
        var clases = getStorageMaterias();


        loop1:
            for (i = 0; i < clases.length; i++) {
                var clase = clases[i];
                console.log("Clase:" + clase.id);
                var grillaActualMisma = -1;
                var todosLosHorariosEnMismaGrilla = true;
                //Verificar si todos los horarios pueden estar en la misma grilla
                //Si no se crea otra grilla 
                loop2:
                    for (o = 0; o < clase.meetingsFaculty.length; o++) {

                        var horario = clase.meetingsFaculty[o];
                        var tamañoHorario = calcularNminutosentreFechas(horario.meetingTime);
                        var posicionX = calcularDia(horario)["value"] - 1;


                        loop3:
                            for (x = 0; x < grillasDeHorarios.length; x++) {
                                var grillaActual = grillasDeHorarios[x];
                                //POSICIONES Y del horario
                                loop4:
                                    for (p = 0; p <= tamañoHorario; p++) {
                                        var dateInicio = new Date(horario.meetingTime.startDate + " " + getHoraHumano(horario.meetingTime.beginTime) + ":00");
                                        var newDateInicio = new Date(dateInicio);
                                        newDateInicio.setMinutes(dateInicio.getMinutes() + p);
                                        var seconds = newDateInicio.getMinutes() == 0 ? "00" : newDateInicio.getMinutes();
                                        var posicionY = calcularPosicionYPorHora(parseInt(newDateInicio.getHours() + "" + seconds));

                                        if (grillaActual[posicionX][posicionY] === undefined && !(grillaActualMisma != -1 && grillaActualMisma != x) && cursosGrillas[x] != clase.courseNumber) {

                                            grillaActualMisma = x;

                                        } else {

                                            todosLosHorariosEnMismaGrilla = false;
                                            break loop2;


                                        }
                                    }
                                    //Si llego al final de horario y todo estan en la mima grilla pero si es diferente de -1 sale del recorrido de grillas
                                if (todosLosHorariosEnMismaGrilla && grillaActual != -1) {
                                    break loop3;
                                }

                            }
                    }
                console.log("GrillaActualMima: " + grillaActualMisma);
                console.log("TodosENlamiamgrilla: " + todosLosHorariosEnMismaGrilla);
                console.log("Horario:");
                console.log(clase.meetingsFaculty);
                console.log("Grillas Antesde revisar si se crea o se añade");
                console.log(JSON.stringify(grillasDeHorarios));
                //Si todos los horario entran en la misma grilla se añaden
                //si no se crea otra y añaden
                if (todosLosHorariosEnMismaGrilla) {
                    for (o = 0; o < clase.meetingsFaculty.length; o++) {
                        var horario = clase.meetingsFaculty[o];
                        var tamañoHorario = calcularNminutosentreFechas(horario.meetingTime);
                        var posicionX = calcularDia(horario)["value"] - 1;

                        for (p = 0; p <= tamañoHorario; p++) {
                            var dateInicio = new Date(horario.meetingTime.startDate + " " + getHoraHumano(horario.meetingTime.beginTime) + ":00");
                            var newDateInicio = new Date(dateInicio);
                            newDateInicio.setMinutes(dateInicio.getMinutes() + p);
                            var seconds = newDateInicio.getMinutes() == 0 ? "00" : (newDateInicio.getMinutes() < 10 ? "0" + newDateInicio.getMinutes() : newDateInicio.getMinutes());
                            var posicionY = calcularPosicionYPorHora(parseInt(newDateInicio.getHours() + "" + seconds));

                            //añaden los horarios
                            grillasDeHorarios[grillaActualMisma][posicionX][posicionY] = clase.id;

                            cursosGrillas[grillaActualMisma] = clase.courseNumber;
                        }
                    }
                } else {
                    //Se crea una grilla y se añaden los horarios y luego se añade la lista de grillas
                    console.log("No vienenennnnn");
                    var newGrilla = getNuevaGrilla();
                    for (o = 0; o < clase.meetingsFaculty.length; o++) {
                        var horario = clase.meetingsFaculty[o];
                        var tamañoHorario = calcularNminutosentreFechas(horario.meetingTime);
                        var posicionX = calcularDia(horario)["value"] - 1;
                        for (p = 0; p <= tamañoHorario; p++) {
                            var dateInicio = new Date(horario.meetingTime.startDate + " " + getHoraHumano(horario.meetingTime.beginTime) + ":00");
                            var newDateInicio = new Date(dateInicio);
                            newDateInicio.setMinutes(dateInicio.getMinutes() + p);
                            var seconds = newDateInicio.getMinutes() == 0 ? "00" : (newDateInicio.getMinutes() < 10 ? "0" + newDateInicio.getMinutes() : newDateInicio.getMinutes());
                            var posicionY = calcularPosicionYPorHora(parseInt(newDateInicio.getHours() + "" + seconds));

                            //añaden los horarios
                            newGrilla[posicionX][posicionY] = clase.id;
                        }
                    }

                    grillasDeHorarios.push(newGrilla);
                    cursosGrillas[(grillasDeHorarios.length) - 1] = clase.courseNumber;

                }
                console.log("Grillas antes de salid de clase");
                console.log(JSON.stringify(grillasDeHorarios));
            }

        buildTableHorarios(grillasDeHorarios);
        console.log("Grillas cursos");
        console.log(cursosGrillas);




    }


    function calcularNminutosentreFechas(meetingTime) {
        var dateInicio = new Date(meetingTime.startDate + " " + getHoraHumano(meetingTime.beginTime) + ":00");
        var dateFin = new Date(meetingTime.startDate + " " + getHoraHumano(meetingTime.endTime) + ":00");
        var diffMillis = (dateFin - dateInicio);
        var difftotal_seconds = parseInt(Math.floor(diffMillis / 1000));
        var total = parseInt(Math.floor(difftotal_seconds / 60));
        return total;
    }

    function buildTableHorarios(grillas) {
        var grillasFiltradas = [];
        var totalTables;
        for (i = 0; i < grillas.length; i++) {
            var grillaActual = grillas[i];
            var grilla = [];
            var tableHTML = "<table border='1'><tr><th>Dia</th><th>Hora Inicio</th><th>Hora Fin</th><th>Materia</th><th>NRC</th><th>Curso</th></tr>";
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
                        var horario = alasql("SELECT * FROM ? as data where data.meetingTime." + diaSemana["value"] + " = true", [materia.meetingsFaculty])
                        console.log("Hoario");

                        tableHTML += "<td>" + diaSemana["name"] + "</td>";
                        tableHTML += "<td>" + (horario.meetingTime.beginTime.substring(0, 2) + ":" + horario.meetingTime.beginTime.substring(2, 4)) + "</td>";
                        tableHTML += "<td>" + (horario.meetingTime.endTime.substring(0, 2) + ":" + horario.meetingTime.endTime.substring(2, 4)) + "</td>";
                        tableHTML += "<td>" + materia.courseTitle + "</td>";
                        tableHTML += "<td>" + materia.courseReferenceNumber + "</td>";
                        tableHTML += "<td>" + materia.courseNumber + "</td>";
                        tableHTML += "<tr>";

                    }
                }
                tableHTML += "</tr>";



                grilla.push(diaFiltrado);
            }
            tableHTML += "</table>";
            totalTables += tableHTML;
            grillasFiltradas.push(grilla);
        }

        console.log(totalTables);



        console.log("Grillas FIltradas");
        console.log(JSON.stringify(grillasFiltradas));


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