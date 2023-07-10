import { ReactElement } from "react";
import styles from "./loading.module.css";

export default function Loader({ loading }): ReactElement {
  const { days, dayTrips } = loading;
  return (days || dayTrips) ?
    <div className={styles.loader}>
      <div className={styles.ldsellipsis}><div></div><div></div><div></div><div></div></div>
    </div> : null;
}