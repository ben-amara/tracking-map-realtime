var center = [58.65, 25.06];
var map = L.map('map', {
    'center': [0, 0],
    'layers': [
      L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        'attribution': 'Map data &copy; OpenStreetMap contributors'
      })
    ]
  }).setView(center, 7)   
var ships = L.icon({
    iconUrl: 'cars.png',
    iconSize: [30, 30]
});

realtime = L.realtime({
    url: 'https://a81edo05e7.execute-api.ca-central-1.amazonaws.com/Production/gps-tracking-realtime',
    crossOrigin: true,
    method: 'POST',
    data: JSON.stringify({"IMEI": "355757082511888"}),
    type: 'json'
}, {
    interval: 1000,        
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {icon: ships});

    }
}).addTo(map);

/*
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);*/

realtime.on('update', function(e) {
    var coordPart = function(v, dirs) {
            return dirs.charAt(v >= 0 ? 0 : 1) +
                (Math.round(Math.abs(v) * 100) / 100).toString();
        },
        popupContent = function(fId) {
            var feature = e.features[fId],
                c = feature.geometry.coordinates;
            return 'Wander drone at ' +
                coordPart(c[1], 'NS') + ', ' + coordPart(c[0], 'EW');
        },
        bindFeaturePopup = function(fId) {
            realtime.getLayer(fId).bindPopup(popupContent(fId));
        },
        updateFeaturePopup = function(fId) {
            realtime.getLayer(fId).getPopup().setContent(popupContent(fId));
        };

    map.fitBounds(realtime.getBounds());

    Object.keys(e.enter).forEach(bindFeaturePopup);
    Object.keys(e.update).forEach(updateFeaturePopup);
});
