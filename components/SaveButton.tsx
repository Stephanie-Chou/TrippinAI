import { ReactElement, useState } from "react";
import { SaveStatus } from "../utils/constants";
import styles from "./splitpillmenu.module.css";
import { useRouter } from 'next/router';

export default function SaveButton({ data, setPageLoading, setPageLoadingText, setAlert }) {
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

  async function fetchUUID() {
    if (!tripLocation) {
      throw new Error('Error: Please Enter a City');
    }
    try {
      const response = await fetch("/api/generateShareURL", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city: tripLocation })
      });

      const dataResponse = await response.json();
      console.log(dataResponse);
      return JSON.parse(dataResponse);
    } catch (error) {
      console.error(error);
    }
  }

  async function createShareable(uuid: string) {
    try {
      await fetch("/api/redis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: JSON.stringify(data), uuid })
      });

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

      await delay(4000)
      setSaveState(SaveStatus.READY);
      setIsButtondisabled(false)
      setPageLoading(false);
    }
  }
  async function onSave(event) {
    setIsButtondisabled(true)
    event.preventDefault();

    setSaveState(SaveStatus.IN_PROGRESS);
    setPageLoading(true);
    setPageLoadingText('Saving your trip ... Get ready to share');
    fetchUUID().then((res) => {
      const humanReadableDate = new Date(res.expire_at)
      setPageLoadingText(`Your trip will be available at https://www.trippinspo.ai/trips?=${res.uuid}`);
      createShareable(res.uuid);
      router.push(`/trips?id=${res.uuid}`);
    }).catch((error: Error) => {
      handleError(error.message)
    })
  }

  async function handleError(error: string) {
    setPageLoading(false);
    setIsButtondisabled(true)
    setAlert(error);
    setSaveState(SaveStatus.READY);
    await delay(3000);
    setAlert(null);
  }

  let saveButtonContent = getSaveButtonContent(saveState);
  return (<button onClick={onSave}>{saveButtonContent}</button>)
}