import styles from "./calendarbutton.module.css";
import { ReactElement } from "react";

export default function CalendarButton({ index, onClick }): ReactElement {

  return (
    <>
      <button className={styles.button_container} onClick={onClick}>
        <div className={styles.calendar_button}>
          <div className={styles.day_tag}>DAY</div>
          <div className={styles.day_number}>{`0${index + 1}`}</div>
        </div>
      </button>
    </>
  );
}