//variables globals
var lastUpdateTime = 0;
var frequenciaActualitzacio = 3;
var interval = setInterval(consultaDades, frequenciaActualitzacio * 1000);

//necesari per google charts
google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(actualitzaGrafica);


$(document).ready(function () {
    // actualitza velocitat de refresc
    $("#myModalGuardar").click(function () {
        frequenciaActualitzacio = $("#myModalNovaFrequencia").val();
        $("#frequencia").text(frequenciaActualitzacio);
        $("#myModal").modal("hide");
        clearInterval(interval);
        interval = setInterval(consultaDades, frequenciaActualitzacio * 1000);  //actualitzem dades cada quan toqui....
    })

    // no volem refrescos
    $("#stop").click(function () {
        clearInterval(interval);
    })

    // volem rebre ara mateix
    $("#rep").click(function () {
        consultaDades();
    })

    //mapa inici
    mymap = L.map('mapid').setView([41.39795, 2.18004], 13);    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

    //L.marker([51.5, -0.09]).addTo(mymap);
    // mapa fi			

})

function consultaDades() {
    $.ajax({url: 'https://api.bsmsa.eu/ext/api/Aparcaments/ParkingService/Parkings/v1/ParkingDataSheet/opendata'})
            .done(function (data) {
                console.log("ok");
                //console.log(data);
                if (data.updateTime != lastUpdateTime)
                {
                    lastUpdateTime = data.updateTime;
                    //actualitzaDadesPantalla(data);
                    actualitzaMapa(data);
                    //actualitzaGrafica(data);
                }
            })
            .fail(function (jqXHR, text, errorThrown) {
                console.log(jqXHR + "---" + text + "---" + errorThrown);
                console.log(jqXHR);
            })
            .always(function (x) {
                console.log("Fí")
            });
}



function actualitzaDadesPantalla(data)
{
    arrayTipus = [];
    arrayBicisPerTipus = [];
    arraySlots = [];

    var linea = "<p>Nova actualització <strong>" + lastUpdateTime + "</strong>";

    //recorro array i vaig posant ja dades
    for (i = 0; i < data.stations.length; i++)
    {
        isNaN(arrayTipus[data.stations[i].type]) ? arrayTipus[data.stations[i].type] = 0 : arrayTipus[data.stations[i].type]++;
        isNaN(arrayBicisPerTipus[data.stations[i].type]) ? arrayBicisPerTipus[data.stations[i].type] = parseInt(data.stations[i].bikes) : arrayBicisPerTipus[data.stations[i].type] += parseInt(data.stations[i].bikes);
        isNaN(arraySlots[data.stations[i].type]) ? arraySlots[data.stations[i].type] = parseInt(data.stations[i].slots) : arraySlots[data.stations[i].type] += parseInt(data.stations[i].slots);
    }
    for (tipo in arrayTipus)
    {
        linea = linea + "<br>Estació tipus:" + tipo + " hi ha <strong>" + arrayTipus[tipo] + "</strong> estacions amb <strong>" + arrayBicisPerTipus[tipo] + "</strong> bicis disponibles i <strong>" + arraySlots[tipo] + "</strong> slots lliures.";
    }
    //afegueixo contingut dins html          
    $("#contingut").html(linea + "</p>");
}


Icono = L.icon({
    iconUrl: 'icono.png',
    iconSize:     [50, 50], // size of the icon
    popupAnchor:  [0, -25] // point from which the popup should open relative to the iconAnchor
});
Icono2 = L.icon({
    iconUrl: 'icono2.png',
    iconSize:     [50, 50], // size of the icon
    popupAnchor:  [0, -25] // point from which the popup should open relative to the iconAnchor
});
function actualitzaMapa(data) {
    if (data !== undefined) {
        data.ParkingList.Parking.forEach(function (element) {
            if (element.ParkingAccess.Access.length == 2) { //Algunos ParkingAccess tienen 2 entradas
                element.ParkingAccess.Access.forEach(function (park) {
                    //L.marker([parseFloat(park.Latitude), parseFloat(park.Longitude)]).addTo(mymap);
                    
                    L.marker([parseFloat(park.Latitude), parseFloat(park.Longitude)],{icon: Icono2}).addTo(mymap)
                            .bindPopup('<b>'+element.Name+'<b>')
                            .openPopup();
                    //L.marker([51.5, -0.09], {icon: greenIcon}).addTo(map);
                    
                });
            } else {
                //L.marker([parseFloat(element.ParkingAccess.Access.Latitude), parseFloat(element.ParkingAccess.Access.Longitude)]).addTo(mymap);
                      L.marker([parseFloat(element.ParkingAccess.Access.Latitude), parseFloat(element.ParkingAccess.Access.Longitude)],{icon: Icono}).addTo(mymap)
                            .bindPopup('<b>'+element.Name+'<b>')
                            .openPopup();
            }
        });
    }
}



function actualitzaGrafica(dada) {
    //https://developers.google.com/chart/interactive/docs/quick_start
    // Create the data table.
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Tipus');
    data.addColumn('number', 'Quantitat');
    if (dada !== undefined) {
        arrayTipus = [];
        // compto numero d'estacions
        for (i = 0; i < dada.stations.length; i++)
        {
            isNaN(arrayTipus[dada.stations[i].type]) ? arrayTipus[dada.stations[i].type] = 0 : arrayTipus[dada.stations[i].type]++;
        }
        var rows = [];
        for (tipo in arrayTipus) {
            rows.push([tipo, arrayTipus[tipo]]);
        }
        data.addRows(rows);
    }

    // Set chart options
    var options = {'title': 'Quantitat d\'estacions per tipus',
        'width': 400,
        'height': 300};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('grafic'));
    chart.draw(data, options);
}