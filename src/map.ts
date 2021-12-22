const map = new google.maps.Map(document.getElementById('map')!, {
  center: { lat: 40.73061, lng: -73.935242 },
  zoom: 13,
  zoomControl: true,
  disableDefaultUI: true,
  gestureHandling: 'cooperative',
});
const polyline = new google.maps.Polyline({
  strokeColor: '#666666',
  strokeOpacity: 1.0,
  strokeWeight: 2.0,
});
map.setOptions({
  styles: [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  ],
});
polyline.setMap(map);

export { map, polyline };
