import { ReactElement } from "react";
import styles from "./form.module.css";

function renderLoader(loading) : ReactElement{
  const {days, dayTrips} = loading;
  return (days || dayTrips) ? 
    <div className={styles.loader}>
      <div className={styles.ldsellipsis}><div></div><div></div><div></div><div></div></div>
    </div>: null;
}

export default function Form({
  cityInput,
  interests,
  loading,
  tripLength,
  setCity,
  setCityInput,
  setTripLength,
  checkedState,
  handleOnChange,
  onSubmit,
}): ReactElement {

  return (
    <div className={styles.form_container}>
      <form onSubmit={onSubmit}>
        <div className={styles.thing}>
          <div className={styles.row}>
            <input
              type="text"
              name="city"
              placeholder="I am going to ..."
              value={cityInput}
              className={styles.child}
              onChange={(e) => {
                setCityInput(e.target.value);
                setCity(e.target.value);
              }}
            />
          </div>
        </div>
        

        <div className={styles.select}>
          <label>How long are you there?</label>
          <select 
            name="tripLength" 
            id="tripLength"
            defaultValue={tripLength}
            onChange={(e) => setTripLength(parseInt(e.target.value))}
          >
            <option value="1">1 Day</option>
            <option value="2">2 Days</option>
            <option value="3">3 Days</option>
            <option value="4">4 Days</option>
            <option value="5">5 Days</option>
          </select>
        </div>


        <p>Why are you traveling?</p>
        <div className={styles.checkboxes}> 
          {
            interests.map((interest: string, index: number) => {
              return (
                <div key={index}>
                  <input
                    type="checkbox"
                    id={`interest-checkbox-${index}`}
                    name={interest}
                    value={interest}
                    checked={checkedState[index].isChecked}
                    onChange={() => handleOnChange(index)
                  }/>
                  <label htmlFor={`interest-checkbox-${index}`}>{interest}</label>
                </div>
                
              )
            })
          }
        </div>
        <input type="submit" value="Plan It" />
        {renderLoader(loading)}
      </form>
    </div>
  );
}