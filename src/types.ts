export interface Props {
  isDuplicate: (k: string) => boolean;
}
export interface Address {
  Address: string;
  LatLng: google.maps.LatLng;
  Marker: google.maps.Marker;
}
export interface OriginRef {
  reset: () => void;
  getState: () => React.MutableRefObject<Address | null>;
}
export interface StopsRef {
  reset: () => void;
  getState: () => AddressList;
}
export interface AddressList {
  [key: string]: Address;
}
export interface Address_LatLng {
  address: string;
  latlng: google.maps.LatLng;
}
export interface Lat_Lng {
  lat: number;
  lng: number;
}
export interface Path_Cost_List {
  [s: string]: Path_Cost;
}
export interface Path_Cost {
  cost: number;
  path: string;
}
export interface BitSet {
  [s: string]: boolean;
}
export interface Origins_Matrix {
  origins: string[];
  matrix: number[][];
}
