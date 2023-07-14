import { ReactElement, useState } from "react";
import { SaveStatus } from "../utils/constants";
import styles from "./splitpillmenu.module.css";
import { useRouter } from 'next/router';

export default function SaveButton({ data }) {
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
        return <div className={styles.downloading}><span className="material-symbols-outlined">downloading</span></div>;
      case SaveStatus.ERROR:
        return <span className="material-symbols-outlined">error</span>;
      default:
        return <div><span className="material-symbols-outlined">download</span><span className="material-symbols-outlined">picture_as_pdf</span></div>;
    }
  }

  async function onSave(event) {
    setIsButtondisabled(true)
    event.preventDefault();

    setSaveState(SaveStatus.IN_PROGRESS);
    try {
      event.preventDefault();
      // create the trip id
      // save the trip data

      const response = await fetch("/api/redis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: JSON.stringify(data), city: tripLocation })
      });

      const dataResponse = await response.json();
      const jsonResponse = JSON.parse(dataResponse);
      const humanReadableDate = new Date(jsonResponse.expire_at)
      console.log(humanReadableDate, jsonResponse.uuid);

      router.push(`/trips?id=${jsonResponse.uuid}`);

      setSaveState(SaveStatus.READY);
      setIsButtondisabled(false)
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      setSaveState(SaveStatus.ERROR);

      await delay(2000)
      setSaveState(SaveStatus.READY);
      setIsButtondisabled(false)
    }
  }

  let saveButtonContent = getSaveButtonContent(saveState);

  return (<button onClick={onSave}>{saveButtonContent}</button>)
}