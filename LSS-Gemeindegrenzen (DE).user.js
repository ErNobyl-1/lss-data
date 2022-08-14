// ==UserScript==
// @name         LSS-Gemeindegrenzen (DE)
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Einstellbare Gemeindegrenzen - sehr Zeit-/Leistungsintensiv
// @author       Jalibu (Original), bearbeitet und angepasst von ErNobyl
// @match        https://www.leitstellenspiel.de/
// @match        https://www.leitstellenspiel.de/profile/*
// @match        https://polizei.leitstellenspiel.de/
// @match        https://polizei.leitstellenspiel.de/profile/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const STORAGE = 'LSS_PLZ_GRENZEN';

    $('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'https://cdn.rawgit.com/patosai/tree-multiselect/v2.4.1/dist/jquery.tree-multiselect.min.css') );
    let style = '<style>div.tree-multiselect>div.selected>div.item{background: #777; color: white;} div.tree-multiselect div.section>div.item{background: #white; color: #777;}</style>';
    $('head').append(style);

    var myStyle = {
        "weight": 2,
        "fillOpacity": 0.025
    };

    let openBtn = '<div id="gemeinden-openBtn" class="leaflet-bar leaflet-control leaflet-control-custom map-expand-button" style="background-image: url(https://raw.githubusercontent.com/jalibu/LSHeat/master/icons8-germany-map-50.png); background-color: white; width: 26px; height: 26px;"></div>';
    $('.leaflet-bottom.leaflet-left').append(openBtn);

    $('#gemeinden-openBtn').click(function(){
        $('#gemeinden-modal').show();
    });

    $.getJSON( "https://raw.githubusercontent.com/RiCENT/lss-data/main/plz-5stellig.json", function( data ) {
        let response = [];
        let state;

        let selected = JSON.parse(localStorage.getItem(STORAGE));

        let markup = '<div id="gemeinden-modal" style="display: none; z-index: 99999; background: #fff; top: 20px; position: absolute; width: 50%; left: 25%" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
        markup += '<div class="modal-header">';
        markup += '<button type="button" class="close gemeinden-close" data-dismiss="modal" aria-hidden="true">×</button>';
        markup += '<h3 style="color:#333;">Angezeigte Gemeinden</h3>';
        markup += '</div>';
        markup += '<div class="modal-body" style="overflow: scroll;">';

        markup += '<select id="gemeinden-selection" multiple="multiple">';
        for(let feature of data.features){
            if(!state || state !== feature.properties.note){
                state = feature.properties.note;
            }
            if(selected && selected.indexOf('' + feature.properties.plz) >= 0){
                L.geoJSON(feature, {style: myStyle}).bindPopup('PLZ/Gemeinde: ' + state).addTo(map);
                markup += '<option value="' + feature.properties.plz + '" selected="selected" data-section="' + state + '">' + state + '</option>';
            } else {
                markup += '<option value="' + feature.properties.plz + '" data-section="' + state + '">' + state + '</option>';
            }
        }
        markup += '</select>';
        markup += '</div>';
        markup += '<div class="modal-footer">';
        markup += '<button class="btn gemeinden-close" data-dismiss="modal" aria-hidden="true">Schließen</button>';
        markup += '<button id="gemeinden-btn-save" class="btn btn-primary">Speichern</button>';
        markup += '</div>';
        markup += '</div>';

        $('body').append(markup);
        $('.gemeinden-close').click(function(){
            $('#gemeinden-modal').hide();
        });

        $('#gemeinden-btn-save').click(function(){
            localStorage.setItem(STORAGE, JSON.stringify($('#gemeinden-selection').val()));
            location.reload();
        });

        $.getScript("https://cdn.rawgit.com/patosai/tree-multiselect/v2.4.1/dist/jquery.tree-multiselect.min.js", function(){
            $("#gemeinden-selection").treeMultiselect({searchable: true, startCollapsed: true});
            $('.tree-multiselect').css('background', '#fff');
        });
    });

})();