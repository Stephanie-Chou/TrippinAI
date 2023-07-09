import { DAY_TRIP_IDS, WHERE_TO_STAY_ID, WHAT_TO_EAT_ID, DownloadButtonStatus } from "../utils/constants";
import styles from "./splitpillmenu.module.css";
import { ReactElement } from "react";

function getDownloadButtonContent(downloadState): ReactElement {
  switch (downloadState) {
    case DownloadButtonStatus.READY:
      return <div><span className="material-symbols-outlined">download</span><span className="material-symbols-outlined">picture_as_pdf</span></div>
    case DownloadButtonStatus.IN_PROGRESS:
      return <span className="material-symbols-outlined">downloading</span>;
    case DownloadButtonStatus.ERROR:
      return <span className="material-symbols-outlined">error</span>;
    default:
      return <div><span className="material-symbols-outlined">download</span><span className="material-symbols-outlined">picture_as_pdf</span></div>;
  }
}
export default function SplitPillMenu({
  onDownload,
  onClick,
  downloadState,
  isDownloadButtonDisabled,
  isButtonDisabled }): ReactElement {

  let downloadButtonContent = getDownloadButtonContent(downloadState)

  return (
    <div className={styles.menu}>
      <button disabled={isButtonDisabled} onClick={() => onClick(WHERE_TO_STAY_ID)}><span className="material-symbols-outlined">hotel</span></button>
      <div className={styles.divider}></div>
      <button disabled={isButtonDisabled} onClick={() => onClick(WHAT_TO_EAT_ID)}><span className="material-symbols-outlined">restaurant</span></button>
      <div className={styles.divider}></div>
      <button disabled={isButtonDisabled} onClick={() => onClick(DAY_TRIP_IDS[0])}><span className="material-symbols-outlined">
        your_trips
      </span></button>
      <div className={styles.divider}></div>
      <button disabled={isDownloadButtonDisabled} onClick={onDownload}>{downloadButtonContent}</button>
    </div>
  );
}

