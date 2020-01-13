import './source.scss';
import {transform} from 'ol/proj';
import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import Circle from 'ol/geom/Circle';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';


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
})
var styles = {
  'Point': new Style({
    image: image
  }),
}
var styleFunction = function(feature) {
  return styles[feature.getGeometry().getType()];
};
var isdflaubert = transform([1.09932, 49.4431], 'EPSG:4326', 'EPSG:3857');
var copeaux = transform([1.0615, 49.4134], 'EPSG:4326', 'EPSG:3857');
var nws = transform([1.066530, 49.428470], 'EPSG:4326', 'EPSG:3857');
var geojsonObject = {
  'type': 'FeatureCollection',
  'crs': {
    'type': 'name',
    'properties': {
      'name': 'EPSG:3857'
    }
  },
  'features': [{
    'type': 'Feature',
    'geometry': {
      'type': 'Point',
      'coordinates': nws
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'Point',
      'coordinates': copeaux
    }
  }, {
    'type': 'Feature',
    'geometry': {
      'type': 'Point',
      'coordinates': isdflaubert
    }
  }]
};

var vectorSource = new VectorSource({
  features: (new GeoJSON()).readFeatures(geojsonObject)
});
vectorSource.addFeature(new Feature(new Circle([5e6, 7e6], 1e6)));
var vectorLayer = new VectorLayer({
  source: vectorSource,
  style: styleFunction
});
var map = new Map({
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    vectorLayer
  ],
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
  }
  map.forEachFeatureAtPixel(e.pixel, function(f){
    console.log(f);
    selected = f;
    f.setStyle(PointHover);
    return true;
  });
});