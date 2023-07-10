import styles from "./canvas.module.css";
import { ReactElement } from "react";

export default function CanvasBackground({ children }): ReactElement {


  return (
    <div className={styles.canvas_container}>
      <div className={styles.canvas}>
        <div className={styles.circles}></div>
        {children}
      </div>
    </div>
  );
}