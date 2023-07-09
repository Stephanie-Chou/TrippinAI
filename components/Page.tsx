import { ReactElement } from "react";
import styles from "./page.module.css";

export default function Page({ header, subheader, children, id }): ReactElement {
  return (
    <div id={id}>
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.tag}>
            <div className={styles.tagHeader}>{header}</div>
            <div className={styles.tagSubheader}>{subheader}</div>
          </div>
        </div>
        <div className={styles.container}>
          {children}
        </div>
      </div>
    </div>
  )
}