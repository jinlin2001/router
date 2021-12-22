import {
  Origins_Matrix,
  AddressList,
  Address,
  Address_LatLng,
  Lat_Lng,
} from './types';
import { map } from './map';

const REGEX_ADDRESS =
  /^(?:\d{1,5}[a-zA-Z]?\s|\d{1,5}-\d{1,5}\s)(?:\w+(?:\.?,?|-\w+\.?,?)?\s){2,10}(?:\w{2},?)(?:\s\d{5}(?:,\s[a-zA-Z]{3})?|\s\d{5}-\d{4})?$/;
const REGEX_STREET = /^(?:[^,])+(?=,)/;

function validAddress(address: string) {
  return REGEX_ADDRESS.test(address);
}

function getStreet(address: string) {
  const match = REGEX_STREET.exec(address);
  if (match) {
    return match[0];
  }
  return address;
}

function newAddress(
  address: string,
  lat_lng: google.maps.LatLng,
  label_text: string
): Address {
  const label = {
    text: label_text,
    fontFamily: 'Material Icons',
    color: '#ffffff',
    fontSize: '18px',
  };
  const map_marker = new google.maps.Marker({
    map,
    label,
    position: lat_lng,
    animation: google.maps.Animation.DROP,
  });
  const street = getStreet(address);
  const map_info_window = new google.maps.InfoWindow({
    content: `<span class="badge text-dark text-wrap text-break">${street}</span>`,
    maxWidth: 120,
  });
  map_marker.addListener('click', () => {
    map_info_window.open({
      map,
      anchor: map_marker,
      shouldFocus: false,
    });
  });
  return { Address: address, LatLng: lat_lng, Marker: map_marker };
}

async function matrixAPI(
  origin: Address,
  dest: Address,
  stops: AddressList
): Promise<Origins_Matrix> {
  const api = new google.maps.DistanceMatrixService();
  const origins = [origin.Address];
  for (const key in stops) {
    origins.push(stops[key].Address);
  }
  const dest_list = [...origins];
  if (origin.Address !== dest.Address) {
    dest_list.push(dest.Address);
  }
  const api_request = {
    origins,
    destinations: dest_list,
    travelMode: google.maps.TravelMode.DRIVING,
  };
  const api_result = await api.getDistanceMatrix(api_request);
  const matrix = api_result.rows.map((row) => {
    const costs: number[] = [];
    let i = 0;
    for (const item of row.elements) {
      costs[i++] = item.distance.value;
    }
    return costs;
  });
  return { origins, matrix };
}

async function geoAPI(location: string | Lat_Lng): Promise<Address_LatLng> {
  const api = new google.maps.Geocoder();
  const api_request =
    typeof location === 'string'
      ? { address: location, componentRestrictions: { country: 'US' } }
      : { location };
  const api_response = await api.geocode(api_request);
  const [result] = api_response.results;
  if (
    result.geometry.location_type !== google.maps.GeocoderLocationType.ROOFTOP
  ) {
    throw new Error(`${result.formatted_address} is not house address.`);
  }
  return {
    address: result.formatted_address,
    latlng: result.geometry.location,
  };
}
const INPUT_CSS = 'form-control rounded-0 border-0 shadow-none';
const BTN_CSS =
  'btn btn-sm btn-outline-secondary border-0 rounded-0 shadow-none text-white';

export {
  geoAPI,
  matrixAPI,
  validAddress,
  getStreet,
  newAddress,
  INPUT_CSS,
  BTN_CSS,
};
