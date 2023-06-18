import styles from "./page.module.css";

export default function Page({header, subheader, children}) {
    return (
        <div>
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