let format = 'image/png';
let map;
let minX = 102.144584655762;
let maxX = 109.469177246094;
let minY = 8.38135528564453;
let maxY = 23.3926944732666;
let cenX = (minX + maxX) / 2;
let cenY = (minY + maxY) / 2;
let mapLat = cenY;
let mapLng = cenX;
let mapDefaultZoom = 6;

function initialize_map() {
    //*
    layerBG = new ol.layer.Tile({
        source: new ol.source.OSM({})
    });
    //*/
    let layerCMR_adm1 = new ol.layer.Image({
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
    let viewMap = new ol.View({
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

    let styles = {
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
    let styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
    };
    let vectorLayer = new ol.layer.Vector({
        //source: vectorSource,
        style: styleFunction
    });
    map.addLayer(vectorLayer);

    function createJsonObj(result) {
        let geojsonObject = `{
            "type": "FeatureCollection",
            "crs": {
                "type": "name",
                "properties": {
                    "name": "EPSG:4326"
                }
            },
            "features": [{
                "type": "Feature",
                "geometry": ${result}
            }]
        }`;
        return geojsonObject;
    }
    function drawGeoJsonObj(paObjJson) {
        let vectorSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(paObjJson, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            })
        });
        let vectorLayer = new ol.layer.Vector({
            source: vectorSource
        });
        map.addLayer(vectorLayer);
    }
    function highLightGeoJsonObj(paObjJson) {
        let vectorSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(paObjJson, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            })
        });
        vectorLayer.setSource(vectorSource);
        /*
        let vectorLayer = new ol.layer.Vector({
            source: vectorSource
        });
        map.addLayer(vectorLayer);
        */
    }
    function highLightObj(result) {
        //alert("result: " + result);
        let strObjJson = createJsonObj(result);
        //alert(strObjJson);
        let objJson = JSON.parse(strObjJson);
        //alert(JSON.stringify(objJson));
        //drawGeoJsonObj(objJson);
        highLightGeoJsonObj(objJson);
    }

    let myPoint = "";
    map.on('singleclick', function (evt) {
        //alert("coordinate: " + evt.coordinate);
        //let myPoint = 'POINT(12,5)';
        let lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        let lon = lonlat[0];
        let lat = lonlat[1];
        myPoint = 'POINT(' + lon + ' ' + lat + ')';
        //alert("myPoint: " + myPoint);
        //*
        $.ajax({
            type: "POST",
            url: "./api.php",
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
        
        $.ajax({
            type: "POST",
            url: "./api.php",
            //dataType: 'json',
            data: { functionname: 'getInfoCMRToAjax', paPoint: myPoint },
            success: function (result, status, erro) {
                $(".info").html(result);
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
            url: "./api.php",
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