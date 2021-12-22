import React, { useImperativeHandle, useRef, useState } from 'react';

import { AddressList, Props, StopsRef } from '../types';
import { hideSpinner, showSpinner } from '../spinner';
import { showToast } from '../toast';
import {
  BTN_CSS,
  geoAPI,
  INPUT_CSS,
  newAddress,
  validAddress,
} from '../utility';

const Stops = React.forwardRef<StopsRef, Props>(({ isDuplicate }, ref) => {
  const input_control = useRef<HTMLInputElement>(null);
  const add_btn = useRef<HTMLButtonElement>(null);
  const [stops, setStops] = useState<AddressList>({});
  const marker_txt = '\ue613';

  const showValid = (valid: boolean): void => {
    if (valid) {
      input_control.current!.value = '';
    }
    input_control.current!.classList.toggle('is-invalid', !valid);
  };

  const addBtnHandler = async () => {
    try {
      showSpinner();
      const address = input_control.current!.value.trim();
      if (!validAddress(address)) {
        throw new Error('Invalid address format.');
      }
      const api_result = await geoAPI(address);
      if (isDuplicate(api_result.address) || api_result.address in stops) {
        throw new Error('Duplicate address.');
      }
      const new_address = newAddress(
        api_result.address,
        api_result.latlng,
        marker_txt
      );
      stops[new_address.Address] = new_address;
      showValid(true);
      setStops({ ...stops });
      hideSpinner();
    } catch (error: any) {
      hideSpinner();
      showValid(false);
      showToast(error.message);
    }
  };

  const deleteHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      showSpinner();
      const key = e.currentTarget.dataset.key!;
      stops[key].Marker.setMap(null);
      delete stops[key];
      setStops({ ...stops });
      hideSpinner();
    } catch (error: any) {
      hideSpinner();
      showToast(error.message);
    }
  };

  useImperativeHandle(ref, () => ({
    reset: () => {
      for (const key in stops) {
        stops[key].Marker.setMap(null);
      }
      input_control.current!.value = '';
      input_control.current!.className = INPUT_CSS;
      setStops({});
    },
    getState: () => {
      return stops;
    },
  }));

  return (
    <div className='flex-fill d-flex flex-column overflow-auto'>
      <div
        className='form-floating d-flex
      '>
        <input
          id='stops-input'
          type='search'
          className={INPUT_CSS}
          placeholder='Stops'
          autoComplete='off'
          ref={input_control}
        />
        <label htmlFor='stops-input' className='fw-bold'>
          Stops
        </label>
        <div className='btn-group-vertical'>
          <button
            className='btn btn-lg border-0 rounded-0 btn-outline-secondary text-white shadow-none'
            onClick={addBtnHandler}
            ref={add_btn}
            style={{ fontSize: '1.132rem' }}>
            Add
          </button>
        </div>
      </div>

      <div className='flex-fill overflow-auto'>
        <ul className='list-group list-group-flush h-100'>
          {Object.keys(stops).map((key) => {
            return (
              <li
                className='d-flex list-group-item border-light bg-transparent'
                key={key}>
                <span className='text-white text-center flex-fill user-select-all'>
                  {key}
                </span>
                <button
                  className={BTN_CSS}
                  data-key={key}
                  onClick={deleteHandler}>
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
});
export default Stops;
