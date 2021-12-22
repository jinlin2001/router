import React, { useEffect, useImperativeHandle, useRef } from 'react';

import { Address, Props, OriginRef, Address_LatLng } from '../types';
import { hideSpinner, showSpinner } from '../spinner';
import { showToast } from '../toast';
import { map } from '../map';
import {
  BTN_CSS,
  geoAPI,
  INPUT_CSS,
  newAddress,
  validAddress,
} from '../utility';

const Origin = React.forwardRef<OriginRef, Props>(({ isDuplicate }, ref) => {
  const input_control = useRef<HTMLInputElement>(null);
  const validate_btn = useRef<HTMLButtonElement>(null);
  const reset_btn = useRef<HTMLButtonElement>(null);
  const origin = useRef<Address | null>(null);
  const marker_txt = '\ue88a';

  const showValid = (valid: boolean) => {
    input_control.current!.readOnly = valid;
    input_control.current!.classList.toggle('is-valid', valid);
    input_control.current!.classList.toggle('is-invalid', !valid);
    validate_btn.current!.disabled = valid;
    reset_btn.current!.disabled = !valid;
  };

  const displayResult = (api_result: Address_LatLng) => {
    const new_origin = newAddress(
      api_result.address,
      api_result.latlng,
      marker_txt
    );
    map.setCenter(new_origin.LatLng);
    input_control.current!.value = new_origin.Address;
    origin.current = new_origin;
    showValid(true);
  };

  const validateBtnHandler = async () => {
    try {
      showSpinner();
      const address = input_control.current!.value.trim();
      if (!validAddress(address)) {
        throw new Error('Invalid address format.');
      }
      const api_result = await geoAPI(address);
      if (isDuplicate(api_result.address)) {
        throw new Error('Duplicate address.');
      }
      displayResult(api_result);
      hideSpinner();
    } catch (error: any) {
      hideSpinner();
      input_control.current!.classList.toggle('is-invalid', true);
      showToast(error.message);
    }
  };

  const resetBtnHandler = () => {
    origin.current?.Marker.setMap(null);
    input_control.current!.value = '';
    input_control.current!.className = INPUT_CSS;
    input_control.current!.readOnly = false;
    validate_btn.current!.disabled = false;
    reset_btn.current!.disabled = true;
    origin.current = null;
  };

  useImperativeHandle(ref, () => ({
    reset: resetBtnHandler,
    getState: () => {
      return origin;
    },
  }));

  useEffect(() => {
    reset_btn.current!.disabled = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          showSpinner();
          const api_result = await geoAPI({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          displayResult(api_result);
          hideSpinner();
        } catch (error: any) {
          hideSpinner();
          showToast(error.message);
        }
      });
    }
  }, []);

  return (
    <div className='d-flex form-floating'>
      <input
        id='origin-input'
        type='search'
        className={INPUT_CSS}
        placeholder='Origin'
        autoComplete='off'
        ref={input_control}
      />
      <label className='fw-bold' htmlFor='origin-input'>
        Origin
      </label>
      <div className='btn-group-vertical'>
        <button
          className={BTN_CSS}
          onClick={validateBtnHandler}
          ref={validate_btn}>
          Validate
        </button>
        <button className={BTN_CSS} onClick={resetBtnHandler} ref={reset_btn}>
          Reset
        </button>
      </div>
    </div>
  );
});
export default Origin;
