import { ReactElement } from "react";
import styles from "./loading.module.css";

export default function Loader({ isLoading, text }): ReactElement {
  return (isLoading) ?
    <div className={styles.loader}>
      <img src="/JourneyGenieLogo_thick.png" className={styles.icon} alt={"Trippinspo Logo: dotted line to location marker"} />
      <p>{text}</p>
      <div className={styles.ldsellipsis}><div></div><div></div><div></div><div></div></div>
    </div> : null;
}