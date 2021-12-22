import React, { useRef } from 'react';

import { OriginRef, StopsRef } from '../types';
import { polyline } from '../map';
import { solve } from '../solve';
import { BTN_CSS, matrixAPI } from '../utility';
import { hideSpinner, showSpinner } from '../spinner';
import { showToast } from '../toast';
import Origin from './Origin';
import Stops from './Stops';
import Destination from './Dest';

function App() {
  const origin = useRef<OriginRef>(null);
  const dest = useRef<OriginRef>(null);
  const stops = useRef<StopsRef>(null);

  const isDuplicate = (address: string) => {
    return address in stops.current!.getState();
  };

  const isOrigin = (address: string) => {
    const origin_state = origin.current!.getState();
    const dest_state = dest.current!.getState();
    return (
      address === origin_state.current?.Address ||
      address === dest_state.current?.Address
    );
  };

  const routeBtnHandler = async () => {
    try {
      showSpinner();
      const origin_state = origin.current!.getState();
      const dest_state = dest.current!.getState();
      if (!origin_state.current || !dest_state.current) {
        throw new Error('Origin and Destination required.');
      }
      const stops_state = stops.current!.getState();
      const stops_state_keys = Object.keys(stops_state);
      const path: google.maps.LatLng[] = [origin_state.current.LatLng];
      if (stops_state_keys.length <= 1) {
        for (const stop_address of stops_state_keys) {
          stops_state[stop_address].Marker.setLabel({
            text: '1',
            color: '#ffffff',
          });
          path.push(stops_state[stop_address].LatLng);
        }
      } else {
        const matrix = await matrixAPI(
          origin_state.current,
          dest_state.current,
          stops_state
        );
        const min_path = solve(matrix);
        let order = 1;
        for (const address of min_path) {
          stops_state[address].Marker.setLabel({
            text: `${order++}`,
            color: '#ffffff',
          });
          path.push(stops_state[address].LatLng);
        }
      }
      path.push(dest_state.current.LatLng);
      polyline.setPath(path);
      hideSpinner();
    } catch (error: any) {
      hideSpinner();
      showToast(error.message);
    }
  };

  const resetBtnHandler = () => {
    try {
      showSpinner();
      polyline.setPath([]);
      origin.current!.reset();
      stops.current!.reset();
      dest.current!.reset();
      hideSpinner();
    } catch (error: any) {
      hideSpinner();
      showToast(error.message);
    }
  };

  return (
    <div className='card h-100 bg-dark border-0 rounded-0'>
      <div className='card-header border-0 p-0'>
        <div className='btn-group w-100'>
          <button className={BTN_CSS} onClick={resetBtnHandler}>
            Reset All
          </button>
          <button className={BTN_CSS} onClick={routeBtnHandler}>
            Get Route
          </button>
        </div>
      </div>

      <div className='card-body p-0 overflow-auto'>
        <div className='d-flex flex-column h-100'>
          <Origin ref={origin} isDuplicate={isDuplicate} />
          <Stops ref={stops} isDuplicate={isOrigin} />
          <Destination ref={dest} isDuplicate={isDuplicate} />
        </div>
      </div>
    </div>
  );
}
export default App;
