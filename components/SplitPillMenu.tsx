import styles from "./splitpillmenu.module.css";
import { ReactElement } from "react";

export default function SplitPillMenu({ onDownload, onClick, downloadText, isDownloadButtonDisabled }): ReactElement {
  return (
    <div className={styles.menu}>
      <div onClick={onClick}>Where to Stay</div>
      <div className={styles.divider}></div>
      <div onClick={onClick}>What to Eat</div>
      <div className={styles.divider}></div>
      <button disabled={isDownloadButtonDisabled} onClick={onDownload}>{downloadText}</button>
    </div>
  );
}

