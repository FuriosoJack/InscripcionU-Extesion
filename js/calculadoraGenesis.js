var grillasDeHorarios;



function getNuevaGrilla()
{
    var grillaHorarios;

    var tamañoX = 5;
    var tamañoY = 1020;
    for(x = 0; x < tamañoX;x++){
        for(y = 0; y < tamañoY; y++){
            grillaHorarios[x][y] = -1;
        }
    }
    return grillaHorarios;
}










