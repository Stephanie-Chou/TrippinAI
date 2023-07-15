import { ReactElement, useState } from "react";
import { SaveStatus } from "../utils/constants";
import styles from "./splitpillmenu.module.css";
import { useRouter } from 'next/router';

export default function SaveButton({ data, setPageLoading, setPageLoadingText }) {
  const router = useRouter();

  const { tripLocation } = data
  const [saveState, setSaveState] = useState(SaveStatus.READY)

  const [isButtondisabled, setIsButtondisabled] = useState(false);

  const delay = ms => new Promise(res => setTimeout(res, ms));

  function getSaveButtonContent(saveState): ReactElement {
    switch (saveState) {
      case SaveStatus.READY:
        return <div><span className="material-symbols-outlined">bookmark</span></div>
      case SaveStatus.IN_PROGRESS:
        return <div className={styles.downloading}><span className="material-symbols-outlined">bookmark</span></div>;
      case SaveStatus.ERROR:
        return <span className="material-symbols-outlined">error</span>;
      default:
        return <div><span className="material-symbols-outlined">download</span><span className="material-symbols-outlined">picture_as_pdf</span></div>;
    }
  }

  async function onSave(event) {
    console.log('onsave');
    setIsButtondisabled(true)
    event.preventDefault();

    setSaveState(SaveStatus.IN_PROGRESS);
    setPageLoading(true);
    setPageLoadingText('Saving your trip ... Get ready to share');
    try {
      event.preventDefault();
      // const response = await fetch("/api/redis", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ data: JSON.stringify(data), city: tripLocation })
      // });

      // const dataResponse = await response.json();
      // const jsonResponse = JSON.parse(dataResponse);
      // const humanReadableDate = new Date(jsonResponse.expire_at)

      // router.push(`/trips?id=${jsonResponse.uuid}`);

      await delay(4000)
      setPageLoadingText('Trip Saved Success');
      setSaveState(SaveStatus.READY);

      await delay(2000)
      setIsButtondisabled(false)
      setPageLoading(false);
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      setSaveState(SaveStatus.ERROR);
      setPageLoadingText('Error Saving Trip. Please Try Again');

      await delay(2000)
      setSaveState(SaveStatus.READY);
      setIsButtondisabled(false)
      setPageLoading(false);
    }
  }

  let saveButtonContent = getSaveButtonContent(saveState);
  console.log('save state', saveState);

  return (<button onClick={onSave}>{saveButtonContent}</button>)
}