import React, { useEffect, useImperativeHandle, useRef } from 'react';

import { Address, Props, OriginRef } from '../types';
import { hideSpinner, showSpinner } from '../spinner';
import { showToast } from '../toast';
import {
  BTN_CSS,
  geoAPI,
  INPUT_CSS,
  newAddress,
  validAddress,
} from '../utility';

const Destination = React.forwardRef<OriginRef, Props>(
  ({ isDuplicate }, ref) => {
    const input_control = useRef<HTMLInputElement>(null);
    const validate_btn = useRef<HTMLButtonElement>(null);
    const reset_btn = useRef<HTMLButtonElement>(null);
    const dest = useRef<Address | null>(null);
    const marker_txt = '\uf06e';

    const showValid = (valid: boolean) => {
      input_control.current!.readOnly = valid;
      input_control.current!.classList.toggle('is-valid', valid);
      input_control.current!.classList.toggle('is-invalid', !valid);
      validate_btn.current!.disabled = valid;
      reset_btn.current!.disabled = !valid;
    };

    const resetBtnHandler = () => {
      dest.current?.Marker.setMap(null);
      input_control.current!.value = '';
      input_control.current!.className = INPUT_CSS;
      input_control.current!.readOnly = false;
      validate_btn.current!.disabled = false;
      reset_btn.current!.disabled = true;
      dest.current = null;
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
        const new_dest = newAddress(
          api_result.address,
          api_result.latlng,
          marker_txt
        );
        input_control.current!.value = new_dest.Address;
        showValid(true);
        dest.current = new_dest;
        hideSpinner();
      } catch (error: any) {
        hideSpinner();
        input_control.current!.classList.toggle('is-invalid', true);
        showToast(error.message);
      }
    };

    useImperativeHandle(ref, () => ({
      reset: resetBtnHandler,
      getState: () => {
        return dest;
      },
    }));

    useEffect(() => {
      reset_btn.current!.disabled = true;
    }, []);

    return (
      <div className='d-flex form-floating'>
        <input
          id='dest-input'
          type='search'
          className={INPUT_CSS}
          placeholder='Destination'
          autoComplete='off'
          ref={input_control}
        />
        <label className='fw-bold' htmlFor='dest-input'>
          Destination
        </label>
        <div className='btn-group-vertical'>
          <button
            className={BTN_CSS}
            onClick={validateBtnHandler}
            ref={validate_btn}>
            Validate
          </button>
          <button className={BTN_CSS} ref={reset_btn} onClick={resetBtnHandler}>
            Reset
          </button>
        </div>
      </div>
    );
  }
);
export default Destination;
