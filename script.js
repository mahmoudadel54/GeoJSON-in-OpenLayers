// The map
let map = new ol.Map({
  target: "map",
  view: new ol.View({
    zoom: 5,
    center: [266812, 5960201],
  }),
  controls: ol.control.defaults({ attribution: false }),
  layers: [
    new ol.layer.Tile({
      title: "Waterolor",
      source: new ol.source.Stamen({ layer: "watercolor" }),
    }),
    new ol.layer.Tile({
      title: "Labels",
      source: new ol.source.Stamen({ layer: "toner-labels" }),
    }),
  ],
});

/**
 * there are different ways to add geojson data to map
 */
//1st approach: using (---file path in your app---)
// GeoJSON vector layer using geojson file with projection 3857
let dataLayerIn3857 = new ol.layer.Vector({
  name: "1914-18",
  source: new ol.source.Vector({
    url: "./fond_guerre.json",
    projection: "EPSG:3857", //the preview projection (defult proj of openLayers)
    format: new ol.format.GeoJSON(),
    attributions: [
      '&copy; <a href="https://data.culture.gouv.fr/explore/dataset/fonds-de-la-guerre-14-18-extrait-de-la-base-memoire">data.culture.gouv.fr</a>',
    ],
  }),
});
map.addLayer(dataLayerIn3857);

// GeoJSON vector layer using geojson file with projection 4326
let dataLayerIn4326 = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: "./dataIn4326.json",
    projection: "EPSG:3857", //the preview projection (defult proj of openLayers)
    format: new ol.format.GeoJSON(),
  }),
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: "#ea1941",
    }),
  }),
});
  map.addLayer(dataLayerIn4326)



//2rd way to add geojson (using WFS service from GIS server like Geoserver)

let wfsURL = "https://www.cmar.csiro.au/geoserver/png_values/wfs?"+
            "request=getFeature&"+
            "TypeName=png_values:ecosystem_values_whales&"+
            "outputFormat=application/json&srsName=EPSG:3857";
    
let WFSLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      url: wfsURL,
      projection: "EPSG:3857", //the preview projection (defult proj of openLayers)
      format: new ol.format.GeoJSON(),
    }),
    style: new ol.style.Style({
        image:new ol.style.Circle({
            stroke: new ol.style.Stroke({
                color:'yellow',
                width:3
            }),
            fill: new ol.style.Fill({
              color: 'green',
            }),
            radius: 6,
          }),
    }),
  });
    map.addLayer(WFSLayer)
   
    

//3rd approach using GeoJSON.readFeatures method (this will work for files and wfs services)

async function addGeoJsonLayerToMap(url) {
    let res = await fetch(url);
    let data = await res.json();
    let vectorLay = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: new ol.format.GeoJSON({
          featureProjection: "EPSG:3857", //the preview projection (defult proj of openLayers)
        }).readFeatures(data),
      }),
      style:new ol.style.Style({
          fill: new ol.style.Fill({
              color:'yellow'
          })
      })
    });
    map.addLayer(vectorLay);
    layer2In4326.addEventListener('click',()=>zoomToLayer(vectorLay))
  }
  
  addGeoJsonLayerToMap("./PolygonsdataIn4326.json");
  

    //zoom to layers
    let layerIn4326 = document.getElementById("layer1");
    let layer2In4326 = document.getElementById("layer3");
    let layerIn3857 = document.getElementById("layer2");
    let layerFromGeoServer = document.getElementById("layer4");
    let layers = [layerIn4326, layerIn3857,layerFromGeoServer];
    window.__map__ = map;
    function zoomToLayer(layer) {
        map.getView().fit(layer.getSource().getExtent(), 10);
}

layers.forEach((lay, index) => {
  lay.addEventListener(
    "click",
    index==1
      ? () => zoomToLayer(dataLayerIn3857)
      : index==2?
      () => zoomToLayer(WFSLayer)
      : () => zoomToLayer(dataLayerIn4326)
  );
});
