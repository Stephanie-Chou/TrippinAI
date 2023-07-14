import SaveButton from "./SaveButton";
import { DAY_TRIP_IDS, WHERE_TO_STAY_ID, WHAT_TO_EAT_ID, DownloadButtonStatus } from "../utils/constants";
import DownloadButton from "./DownloadButton";
import styles from "./splitpillmenu.module.css";
import { ReactElement } from "react";

export default function SplitPillMenu({
  isButtonDisabled,
  isLoading,
  itineraryData,
  onClick,
  showShare }): ReactElement {

  return (
    <div className={styles.menu}>
      <button disabled={isButtonDisabled} onClick={() => onClick(DAY_TRIP_IDS[0])}><span className="material-symbols-outlined">
        your_trips
      </span></button>
      <div className={styles.divider}></div>
      <button disabled={isButtonDisabled} onClick={() => onClick(WHERE_TO_STAY_ID)}><span className="material-symbols-outlined">hotel</span></button>
      <div className={styles.divider}></div>
      <button disabled={isButtonDisabled} onClick={() => onClick(WHAT_TO_EAT_ID)}><span className="material-symbols-outlined">restaurant</span></button>
      <div className={styles.divider}></div>
      <DownloadButton itineraryData={itineraryData} isLoading={isLoading} />
      {showShare && <div className={styles.divider}></div>}
      {showShare && <SaveButton data={itineraryData} />}
    </div>
  );
}

