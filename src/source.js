import './source.scss';
import {transform} from 'ol/proj';
import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import Circle from 'ol/geom/Circle';
import {toStringHDMS} from 'ol/coordinate';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import Overlay from 'ol/Overlay';
import {toLonLat} from 'ol/proj';

var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var geojsonObject;
var nws = transform([1.066530, 49.428470], 'EPSG:4326', 'EPSG:3857');
var image = new CircleStyle({
  radius: 5,
  fill: null,
  stroke: new Stroke({color: 'red', width: 5})
});
var PointHover= new Style({
  image: new CircleStyle({
    radius: 10,
    fill: null,
    stroke: new Stroke({color: 'green', width: 10})
  })
});
var styles = {
  'Point': new Style({
    image: image
  }),
}
var styleFunction = function(feature) {
  return styles[feature.getGeometry().getType()];
}

var xhttp = new XMLHttpRequest();
var url = "http://localhost:8080/site/geolocalisation";
xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
      geojsonObject = JSON.parse(this.responseText);
      geojsonObject['features'].forEach(element => {
        element['geometry']['coordinates']=transform(element['geometry']['coordinates'],'EPSG:4326', 'EPSG:3857');
      });
      var vectorSource = new VectorSource({
        features: (new GeoJSON()).readFeatures(geojsonObject)
      });
      vectorSource.addFeature(new Feature(new Circle([5e6, 7e6], 1e6)));
      var vectorLayer = new VectorLayer({
        source: vectorSource,
        style: styleFunction
      });
      var overlay = new Overlay({
        element: container,
        autoPan: true,
        autoPanAnimation: {
          duration: 250
        }
      });
      closer.onclick = function() {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
      };
      var map = new Map({
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          vectorLayer
        ],
        overlays: [overlay],
        target: 'carteNWS',
        view: new View({
          projection: 'EPSG:3857',
          center: nws,
          zoom: 12
        })
      });
      var selected = null;
      map.on('pointermove', function(e){
        if (selected !== null){
          selected.setStyle(undefined);
          selected = null;
          overlay.setPosition(undefined);
        }
        map.forEachFeatureAtPixel(e.pixel, function(f){
          selected = f;
          f.setStyle(PointHover);
          var coordinate = e.coordinate;
          content.innerHTML = '<h3>' + f.get('libelle') + '</h3>' + 
                                       f.get('adresse') + '</br>' +
                              'poste occupés: ' + f.get('poste') + '</br>' +
                              'Sujets des stages/alternances: ' +  f.get('sujet') + '</br>' +
                              'code APE: ' +  f.get('code_APE') + '</br>' +
                              'CA: ' +  f.get('CA') + '</br>' +
                              'filière: ' +  f.get('filiere') + '</br>' +
                              'dates: ' +  f.get('date');
          overlay.setPosition(coordinate);
          return true;
        });
      });
      map.on('singleclick', function(evt) {
        var coordinate = evt.coordinate;
        var hdms = toStringHDMS(toLonLat(coordinate));

        content.innerHTML = '<p>You clicked here:</p><code>' + hdms +
            '</code>';
        overlay.setPosition(coordinate);
      });
  }
};
xhttp.open("GET",url, true);
xhttp.send();



// var geojsonObject = {
//   'type': 'FeatureCollection',
//   'crs': {
//     'type': 'name',
//     'properties': {
//       'name': 'EPSG:3857'
//     }
//   },
//   'features': [{
//     'type': 'Feature',
//     'geometry': {
//       'type': 'Point',
//       'coordinates': nws
//     }
//   }, {
//     'type': 'Feature',
//     'geometry': {
//       'type': 'Point',
//       'coordinates': copeaux
//     }
//   }, {
//     'type': 'Feature',
//     'geometry': {
//       'type': 'Point',
//       'coordinates': isdflaubert
//     }
//   }]
// };
