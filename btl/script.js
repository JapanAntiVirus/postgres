var format = 'image/png';
var map;
var minX = 102.144584655762;
var maxX = 109.469177246094;
var minY = 8.38135528564453;
var maxY = 23.3926944732666;
var cenX = (minX + maxX) / 2;
var cenY = (minY + maxY) / 2;
var mapLat = cenY;
var mapLng = cenX;
var mapDefaultZoom = 6;

function initialize_map() {
    //*
    layerBG = new ol.layer.Tile({
        source: new ol.source.OSM({})
    });
    //*/
    var layerCMR_adm1 = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/btl/wms?',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.1',
                STYLES: '',
                LAYERS: 'gadm36_vnm_2',
            }
        })
    });
    var viewMap = new ol.View({
        center: ol.proj.fromLonLat([mapLng, mapLat]),
        zoom: mapDefaultZoom
        //projection: projection
    });
    map = new ol.Map({
        target: "map",
        layers: [layerBG, layerCMR_adm1],
        //layers: [layerCMR_adm1],
        view: viewMap
    });
    //map.getView().fit(bounds, map.getSize());

    var styles = {
        'MultiPolygon': new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'orange'
            }),
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 2
            })
        })
    };
    var styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
    };
    var vectorLayer = new ol.layer.Vector({
        //source: vectorSource,
        style: styleFunction
    });
    map.addLayer(vectorLayer);

    function createJsonObj(result) {
        var geojsonObject = '{'
            + '"type": "FeatureCollection",'
            + '"crs": {'
            + '"type": "name",'
            + '"properties": {'
            + '"name": "EPSG:4326"'
            + '}'
            + '},'
            + '"features": [{'
            + '"type": "Feature",'
            + '"geometry": ' + result
            + '}]'
            + '}';
        return geojsonObject;
    }
    function drawGeoJsonObj(paObjJson) {
        var vectorSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(paObjJson, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            })
        });
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource
        });
        map.addLayer(vectorLayer);
    }
    function highLightGeoJsonObj(paObjJson) {
        var vectorSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(paObjJson, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            })
        });
        vectorLayer.setSource(vectorSource);
        /*
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource
        });
        map.addLayer(vectorLayer);
        */
    }
    function highLightObj(result) {
        //alert("result: " + result);
        var strObjJson = createJsonObj(result);
        //alert(strObjJson);
        var objJson = JSON.parse(strObjJson);
        //alert(JSON.stringify(objJson));
        //drawGeoJsonObj(objJson);
        highLightGeoJsonObj(objJson);
    }

    var myPoint = "";
    map.on('singleclick', function (evt) {
        //alert("coordinate: " + evt.coordinate);
        //var myPoint = 'POINT(12,5)';
        var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        var lon = lonlat[0];
        var lat = lonlat[1];
        myPoint = 'POINT(' + lon + ' ' + lat + ')';
        //alert("myPoint: " + myPoint);
        //*
        $.ajax({
            type: "POST",
            url: "./CMR_pgsqlAPI.php",
            //dataType: 'json',
            data: { functionname: 'getGeoCMRToAjax', paPoint: myPoint },
            success: function (result, status, erro) {
                // $(".info").html(result);
                highLightObj(result);
            },
            error: function (req, status, error) {
                alert(req + " " + status + " " + error);
            }
        });
        //*/

    });
    $(".btn").click(function () {
        $.ajax({
            type: "POST",
            url: "./CMR_pgsqlAPI.php",
            //dataType: 'json',
            data: { functionname: 'getInfoCMRToAjax', paPoint: myPoint },
            success: function (result, status, erro) {
                $(".info").html(result);
            },
            error: function (req, status, error) {
                alert(req + " " + status + " " + error);
            }
        });
    });
};