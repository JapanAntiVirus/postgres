let format = 'image/png';
let map;
let minX = 102.107963562012;
let maxX = 109.505798339844;
let minY = 8.30629825592041;
let maxY = 23.4677505493164;
let cenX = (minX + maxX) / 2;
let cenY = (minY + maxY) / 2;
let mapLat = cenY;
let mapLng = cenX;
let mapDefaultZoom = 6;
let zoom = 6;
let layerCMR_adm = [];
let indexLayer = 0;

for(let i=0; i<3; i++){
    layerCMR_adm.push(new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/btl/wms?',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.1',
                STYLES: '',
                LAYERS: `gadm36_vnm_${i+1}`,
            }
        })
    }));
}

function initialize_map() {
    layerBG = new ol.layer.Tile({
        source: new ol.source.OSM({})
    });
    let viewMap = new ol.View({
        center: ol.proj.fromLonLat([mapLng, mapLat]),
        zoom: mapDefaultZoom
    });

    map = new ol.Map({
        target: "map",
        layers: [layerBG, layerCMR_adm[indexLayer]],
        view: viewMap
    });
    let styles = {
        'MultiPolygon': new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#d8d8c0'
            }),
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 2
            })
        }),
        'Polygon': new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#d8d8c0'
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

    function highLightGeoJsonObj(paObjJson) {
        let vectorSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(paObjJson, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            })
        });
        vectorLayer.setSource(vectorSource);

    }
    function highLightObj(result) {
        let strObjJson = createJsonObj(result);
        let objJson = JSON.parse(strObjJson);
        // objJson.type = 'MultiPolygon';
        console.log(objJson.type)
        highLightGeoJsonObj(objJson);
    }

    let myPoint = "";
    map.on('singleclick', function (evt) {
        let lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        let lon = lonlat[0];
        let lat = lonlat[1];
        myPoint = 'POINT(' + lon + ' ' + lat + ')';

        //highlight vung click vao
        $.ajax({
            type: "POST",
            url: "./api.php",
            //dataType: 'json',
            data: { functionname: 'getGeoCMRToAjax', paPoint: myPoint, layer: indexLayer },
            success: function (result, status, erro) {
                highLightObj(result);
            },
            error: function (req, status, error) {
                alert(req + " " + status + " " + error);
            }
        });

        //lay thong tin vung duoc click
        $.ajax({
            type: "POST",
            url: "./api.php",
            //dataType: 'json',
            data: { functionname: 'getInfoCMRToAjax', paPoint: myPoint, layer: indexLayer },
            success: function (result, status, erro) {
                let data = JSON.parse(result);
                let s = `
                    <div>${data.type_3 || ''} ${data.name_3 || ''} - ${data.type_2 || ''} ${data.name_2 || ''} - ${data.type_1 || ''} ${data.name_1 || ''}</div>
                    <div>Chu vi: ${Math.round(data.chu_vi)} mét </div>
                    <div>Diện tích: ${Math.round(data.dien_tich)} km vuông </div>
                `;

                $(".info").html(s);
            },
            error: function (req, status, error) {
                alert(req + " " + status + " " + error);
            }
        });

    });

    map.on('moveend', function(e) {
        let newZoom = map.getView().getZoom();
        if(zoom == newZoom){
            return;
        }
        if(newZoom > 12){
            indexLayer = 2;
        }
        else if(newZoom >= 10){
            indexLayer = 1;
        }
        else{
            indexLayer = 0
        }
        // console.log(indexLayer)
        zoom = newZoom;
        for(let i=0; i<3; i++){
            map.removeLayer(layerCMR_adm[i]);
        }
        map.removeLayer(vectorLayer);
        map.addLayer(layerCMR_adm[indexLayer])
        map.addLayer(vectorLayer);

        $('#layer').html(`gadm36_vnm_${indexLayer+1}`);
      });

      $('#btnSearch').click(function () { 
          let stringSearch = $('#txtSearch').val();
          stringSearch = stringSearch.trim().replace(/\s.|^./g, function(c) {
            return c.toUpperCase();
        });
          console.log(stringSearch);
          $.ajax({
            type: "POST",
            url: "./api.php",
            //dataType: 'json',
            data: { functionname: 'searchPlace', layer: indexLayer, stringSearch: stringSearch },
            success: function (result, status, erro) {
                result = result || '{"type": "MultiPolygon", "coordinates":[]}';
                console.log(result)
                highLightObj(result);
            },
            error: function (req, status, error) {
                alert(req + " " + status + " " + error);
            }
        });


      });
};

