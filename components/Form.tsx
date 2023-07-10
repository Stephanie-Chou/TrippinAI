import { ReactElement } from "react";
import styles from "./form.module.css";

function renderLoader(loading): ReactElement {
  const { days, dayTrips } = loading;
  return (days || dayTrips) ?
    <div className={styles.loader}>
      <div className={styles.ldsellipsis}><div></div><div></div><div></div><div></div></div>
    </div> : null;
}

export default function Form({
  cityInput,
  interests,
  loading,
  tripLength,
  setCity,
  setCityInput,
  checkedState,
  handleOnChange,
  handleTripLengthChange,
  onSubmit,
}): ReactElement {
  const dayUnit = tripLength === 1 ? "day" : "days";
  return (
    <div className={styles.form_container}>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          name="city"
          placeholder="I'm going to... "
          value={cityInput}
          className={styles.child}
          onChange={(e) => {
            setCityInput(e.target.value);
            setCity(e.target.value);
          }}
        />

        <div>
          <div className={styles.text}>My trip is</div>
          <div className={styles.select}>
            <select
              name="tripLength"
              id="tripLength"
              defaultValue={tripLength}
              onChange={handleTripLengthChange}
            >
              <option value="1">one</option>
              <option value="2">two</option>
              <option value="3">three</option>
              <option value="4">four</option>
              <option value="5">five</option>
            </select>
          </div>
          <div className={styles.text}>{dayUnit}.</div>
        </div>


        <div className={styles.interests}>
          <div className={styles.text}>I am interested in</div>
          <div className={styles.checkboxes}>
            {
              interests.map((interest: string, index: number) => {
                return (
                  <div key={index} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      id={`interest-checkbox-${index}`}
                      name={interest}
                      value={interest}
                      checked={checkedState[index].isChecked}
                      onChange={() => handleOnChange(index)
                      } />
                    <label htmlFor={`interest-checkbox-${index}`}>{interest}</label>
                  </div>
                )
              })
            }
          </div>
        </div>

        <input type="submit" value="Plan It" />
        {renderLoader(loading)}
      </form>
    </div>
  );
}