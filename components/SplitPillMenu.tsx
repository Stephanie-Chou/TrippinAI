import SaveButton from "./SaveButton";
import ShareButton from "./ShareButton";
import { DAY_TRIP_IDS, WHERE_TO_STAY_ID, WHAT_TO_EAT_ID, DownloadButtonStatus } from "../utils/constants";
import DownloadButton from "./DownloadButton";
import styles from "./splitpillmenu.module.css";
import { ReactElement, useState } from "react";

export default function SplitPillMenu({
  isButtonDisabled,
  setPageLoading,
  setPageLoadingText,
  itineraryData,
  onClick,
  showSave,
  showShare }): ReactElement {

  const [alert, setAlert] = useState(null);

  return (
    <div className={styles.menu_container}>
      {alert && <div className={styles.alert}>{alert}</div>}
      <div className={styles.menu}>
        <button disabled={isButtonDisabled} onClick={() => onClick(DAY_TRIP_IDS[0])}><span className="material-symbols-outlined">
          your_trips
        </span></button>
        <div className={styles.divider}></div>
        <button disabled={isButtonDisabled} onClick={() => onClick(WHERE_TO_STAY_ID)}><span className="material-symbols-outlined">hotel</span></button>
        <div className={styles.divider}></div>
        <button disabled={isButtonDisabled} onClick={() => onClick(WHAT_TO_EAT_ID)}><span className="material-symbols-outlined">restaurant</span></button>
        <div className={styles.divider}></div>
        <DownloadButton data={itineraryData} setPageLoading={setPageLoading} setPageLoadingText={setPageLoadingText} />
        {showSave && <div className={styles.divider}></div>}
        {showSave && <SaveButton
          data={itineraryData}
          setPageLoading={setPageLoading}
          setPageLoadingText={setPageLoadingText}
          setAlert={setAlert}
        />}
        {showShare && <div className={styles.divider}></div>}
        {showShare && <ShareButton setAlert={setAlert} />}
      </div>
    </div>

  );
}

