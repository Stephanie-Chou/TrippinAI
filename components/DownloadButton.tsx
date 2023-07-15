import { ReactElement, useState } from "react";
import { DownloadButtonStatus } from "../utils/constants";
import styles from "./splitpillmenu.module.css";

export default function DownloadButton({ data, setPageLoading, setPageLoadingText }) {
  const { tripLocation, neighborhoods, activities, foods, dayTrips } = data;
  const [downloadButtonState, setDownloadButtonState] = useState(DownloadButtonStatus.READY);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const delay = ms => new Promise(res => setTimeout(res, ms));

  function getDownloadButtonContent(downloadState): ReactElement {
    switch (downloadState) {
      case DownloadButtonStatus.READY:
        return <div><span className="material-symbols-outlined">picture_as_pdf</span></div>
      case DownloadButtonStatus.IN_PROGRESS:
        return <div className={styles.downloading}><span className="material-symbols-outlined">downloading</span></div>;
      case DownloadButtonStatus.ERROR:
        return <span className="material-symbols-outlined">error</span>;
      default:
        return <div><span className="material-symbols-outlined">download</span><span className="material-symbols-outlined">picture_as_pdf</span></div>;
    }
  }

  async function onDownload(event): Promise<string> {
    console.log('clicked on download', tripLocation, data)
    event.preventDefault();

    if (!tripLocation) {
      return;
    };
    setIsButtonDisabled(true)
    setDownloadButtonState(DownloadButtonStatus.IN_PROGRESS);
    try {
      const response = await fetch("/api/createPDF", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: tripLocation,
          neighborhoods: neighborhoods,
          activities: activities,
          foods: foods,
          dayTrips: dayTrips
        })
      });

      const responseData = await response.json();
      if (response.status !== 200) {
        throw responseData.error || new Error(`Request failed with status ${response.status}`);
      }
      let arr = new Uint8Array(responseData.result.data);
      let buffer = arr.buffer

      let blob = new Blob([buffer], { type: "application/pdf" });
      const href = URL.createObjectURL(blob);

      // Creating new object of PDF file
      // Setting various property values
      let alink = document.createElement('a');
      document.body.appendChild(alink); // Required for this to work in FireFox
      alink.href = href;
      alink.download = "Trippin_Itinerary.pdf"
      alink.target = "_blank";
      alink.click();
      setPageLoadingText('PDF Downloaded Success');
      setDownloadButtonState(DownloadButtonStatus.READY);

      await delay(1000)
      setIsButtonDisabled(false)
      setPageLoading(false);
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      setDownloadButtonState(DownloadButtonStatus.ERROR);
      setPageLoadingText('Error Saving Trip. Please Try Again');

      await delay(2000)
      setDownloadButtonState(DownloadButtonStatus.READY);
      setIsButtonDisabled(false)
      setPageLoading(false);
    }
  }

  let downloadButtonContent = getDownloadButtonContent(downloadButtonState);
  return (<button disabled={isButtonDisabled} onClick={onDownload}>{downloadButtonContent}</button>)
}