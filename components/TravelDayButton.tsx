import styles from "./calendarbutton.module.css";
import { ReactElement } from "react";

export default function TravelDayButton({ onClick }): ReactElement {

  return (
    <button className={styles.button_container} onClick={onClick}>
      <div className={styles.calendar_button}>
        <span className={styles.material_symbols_outlined} />
        <div className={styles.day_tag}>Travel Day</div>
      </div>
    </button>
  );
}