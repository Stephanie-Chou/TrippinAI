import { DAY_TRIP_IDS, WHERE_TO_STAY_ID } from "../utils/constants";
import styles from "./splitpillmenu.module.css";
import { ReactElement } from "react";

export default function SplitPillMenu({
  onDownload,
  onClick,
  downloadText,
  isDownloadButtonDisabled,
  isButtonDisabled }): ReactElement {
  return (
    <div className={styles.menu}>
      <button disabled={isButtonDisabled} onClick={() => onClick(WHERE_TO_STAY_ID)}>Where to Stay</button>
      <div className={styles.divider}></div>
      <button disabled={isButtonDisabled} onClick={() => onClick(DAY_TRIP_IDS[0])}>Day Trips</button>
      <div className={styles.divider}></div>
      <button disabled={isDownloadButtonDisabled} onClick={onDownload}>{downloadText}</button>
    </div>
  );
}

