//variables globals
var lastUpdateTime = 0;
var frequenciaActualitzacio = 3;
var interval = setInterval(consultaDades, frequenciaActualitzacio * 1000);
var markSeleccionado;
var PosicinDestino;
var Doble = 0;
var Indi = 0;
var Electri = 0;
var Acces = 0;

//necesari per google charts
google.charts.load('current', {'packages': ['bar']});
google.charts.setOnLoadCallback(actuBarras);

$(document).ready(function () {
    $("#myModalGuardar").click(function () {
        frequenciaActualitzacio = $("#myModalNovaFrequencia").val();
        $("#frequencia").text(frequenciaActualitzacio);
        $("#myModal").modal("hide");
        clearInterval(interval);
        interval = setInterval(consultaDades, frequenciaActualitzacio * 1000);
    })

    $("#stop").click(function () {
        clearInterval(interval);
    })

    $("#rep").click(function () {
        consultaDades();
    })

    $("#quitaRuta").click(function () {
        PosicinDestino.spliceWaypoints(1, 1);
    })

    mymap = L.map('mapid').setView([41.39795, 2.18004], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);

    //Posicion actual real
    navigator.geolocation.getCurrentPosition(function (position) {
        PosicinDestino = L.Routing.control({
            waypoints: [
                L.latLng(position.coords.latitude, position.coords.longitude)
            ],
            language: 'es',
        }).addTo(mymap);
    });
})


function consultaDades() {
    $.ajax({url: 'https://api.bsmsa.eu/ext/api/Aparcaments/ParkingService/Parkings/v1/ParkingDataSheet/opendata'})
            .done(function (data) {
                console.log("Ok");
                if (data.updateTime != lastUpdateTime)
                {
                    lastUpdateTime = data.updateTime;
                    actualitzaMapa(data);
                    //actualitzaGrafica(data);
                }
            })
            .fail(function (jqXHR, text, errorThrown) {
                console.log(jqXHR + "---" + text + "---" + errorThrown);
                console.log(jqXHR);
            })
            .always(function (x) {
                console.log("Fin")
            });
}

Icono = L.icon({
    iconUrl: 'icono.png',
    iconSize: [50, 50], // size of the icon
    popupAnchor: [0, -25] // point from which the popup should open relative to the iconAnchor
});
Icono2 = L.icon({
    iconUrl: 'icono2.png',
    iconSize: [50, 50], // size of the icon
    popupAnchor: [0, -25] // point from which the popup should open relative to the iconAnchor
});

function actualitzaMapa(data) {
    Doble = 0;
    Indi = 0;
    Electri = 0;
    Acces = 0;

    if (data !== undefined) {
        data.ParkingList.Parking.forEach(function (element) {

            if (element.ElectricCharger = 1) {
                Electri++;
            }
            if (element.HandicapAccess = 1) {
                Acces++;
            }


            if (element.ParkingAccess.Access.length == 2) { //Algunos ParkingAccess tienen 2 entradas
                Doble++;
                element.ParkingAccess.Access.forEach(function (park) {

                    L.marker([parseFloat(park.Latitude), parseFloat(park.Longitude)], {icon: Icono2})
                            .bindPopup('<b>' + element.Name + '<b>')
                            .on('dblclick', function () {
                                var carga;
                                var elevador;
                                var exterior;
                                var handicapAccess;
                                $("#Seleccion").modal();
                                $('#headMd').text('Name: ' + element.Name);
                                $('#Address').text('Address: ' + element.Address);
                                $('#AccessAddress').text('Access address: ' + element.ParkingAccess.Access.AccessAddress);

                                if (element.ElectricCharger = 1) {
                                    carga = "Si";
                                } else {
                                    carga = "No";
                                }
                                $('#ElectricCharger').text('ElectricCharger: ' + carga);

                                if (element.Elevator = 1) {
                                    elevador = "Si";
                                } else {
                                    elevador = "No";
                                }
                                $('#Elevator').text('Elevator: ' + elevador);

                                if (element.Exterior = 1) {
                                    exterior = "Si";
                                } else {
                                    exterior = "No";
                                }
                                $('#Exterior').text('Exterior: ' + exterior);

                                if (element.HandicapAccess = 1) {
                                    handicapAccess = "Si";
                                } else {
                                    handicapAccess = "No";
                                }
                                $('#HandicapAccess').text('HandicapAccess: ' + handicapAccess);
                                $('#MaxHeight').text('MaxHeight: ' + element.MaxHeight);
                                $('#Open').text('Open: ' + element.Open);
                                $('#Close').text('Close: ' + element.Close);
                                $('#PriceMoto').text('PriceMoto : ' + element.ParkingPriceList.Price[0].Amount);
                                $('#PriceTurisme').text('PriceTurisme : ' + element.ParkingPriceList.Price[1].Amount);


                                $("#trRuta").click(function () {
                                    PosicinDestino.spliceWaypoints(1, 1, L.latLng(parseFloat(park.Latitude), parseFloat(park.Longitude)));
                                    $('#Seleccion').modal('hide');
                                })
                            })
                            .addTo(mymap);
                });
            } else {
                Indi++;
                markSeleccionado = L.marker([parseFloat(element.ParkingAccess.Access.Latitude), parseFloat(element.ParkingAccess.Access.Longitude)], {icon: Icono})
                        .bindPopup('<b>' + element.Name + '<b>')
                        .on('dblclick', function () {
                            var carga;
                            var elevador;
                            var exterior;
                            var handicapAccess;
                            $("#Seleccion").modal();
                            $('#headMd').text('Name: ' + element.Name);
                            $('#Address').text('Address: ' + element.Address);
                            $('#AccessAddress').text('Access address: ' + element.ParkingAccess.Access.AccessAddress);

                            if (element.ElectricCharger = 1) {
                                carga = "Si";
                            } else {
                                carga = "No";
                            }
                            $('#ElectricCharger').text('ElectricCharger: ' + carga);

                            if (element.Elevator = 1) {
                                elevador = "Si";
                            } else {
                                elevador = "No";
                            }
                            $('#Elevator').text('Elevator: ' + elevador);

                            if (element.Exterior = 1) {
                                exterior = "Si";
                            } else {
                                exterior = "No";
                            }
                            $('#Exterior').text('Exterior: ' + exterior);

                            if (element.HandicapAccess = 1) {
                                handicapAccess = "Si";
                            } else {
                                handicapAccess = "No";
                            }
                            $('#HandicapAccess').text('HandicapAccess: ' + handicapAccess);
                            $('#MaxHeight').text('MaxHeight: ' + element.MaxHeight);
                            $('#Open').text('Open: ' + element.Open);
                            $('#Close').text('Close: ' + element.Close);
                            $('#PriceMoto').text('PriceMoto : ' + element.ParkingPriceList.Price[0].Amount);
                            $('#PriceTurisme').text('PriceTurisme : ' + element.ParkingPriceList.Price[1].Amount);


                            $("#trRuta").click(function () {
                                PosicinDestino.spliceWaypoints(1, 1, L.latLng(parseFloat(element.ParkingAccess.Access.Latitude), parseFloat(element.ParkingAccess.Access.Longitude)));
                                $('#Seleccion').modal('hide');
                            })
                        })
                        .addTo(mymap);
            }
        });
    }
    actualitzaDadesPantalla(data.ParkingList.Parking.length);
    actuBarras();
}


function actualitzaDadesPantalla(total)
{
    var linea = "<p>Nueva actualización <strong>" + lastUpdateTime + "</strong>" +
            "<br>Total Parkings: <strong>" + total + "</strong>" +
            "<br>Con doble entrada: <strong>" + Doble + "</strong>" +
            "<br>Con una sola entrada: <strong>" + Indi + "</strong>" +
            "<br>Con carga electrica: <strong>" + Electri + "</strong>" +
            "<br>Con acceso para discapacitados: <strong>" + Acces + "</strong>";

    $("#contenido").html(linea + "</p>");
}



$(document).ready(function () {
    $("#myBtn").click(function () {
        $("#myModal").modal();
    });
});


function actuBarras() {
    var data = new google.visualization.arrayToDataTable([
        ['Parkings', 'Cantidad'],
        ['Parkings con doble entrada', Doble],
        ['Parkings con una sola entrada', Indi],
        ['Parking con carga electrica', Electri],
        ['Parking con acceso para discapacitados', Acces]
    ]);

    var options = {
        width: 800,
        bars: 'horizontal',
    };

    var chart = new google.charts.Bar(document.getElementById('barras'));
    chart.draw(data, options);
}
;