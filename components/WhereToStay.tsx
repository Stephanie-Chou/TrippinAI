import { WHERE_TO_STAY_ID } from "../utils/constants";
import { getStreamResponse } from "../utils/getStreamResponse";
import Page from "./Page";
import styles from "./day.module.css";
import { ReactElement, useState } from "react";

export default function WhereToStay({ locationName, whereToStay }): ReactElement {
  const subheader: string = "Where to Stay";

  return (
    <>
      <Page
        header={locationName}
        subheader={subheader}
        id={WHERE_TO_STAY_ID}
      >
        <h3>Where to Stay in {locationName}</h3>
        <div
          className={styles.day_description}
          dangerouslySetInnerHTML={{ __html: whereToStay }}
        />
      </Page>
    </>
  );
}