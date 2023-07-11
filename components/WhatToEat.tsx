import { WHAT_TO_EAT_ID } from "../utils/constants";
import { getStreamResponse } from "../utils/getStreamResponse";
import Page from "./Page";
import styles from "./day.module.css";
import { ReactElement } from "react";

export default function WhatToEat({ locationName, whatToEat }): ReactElement {
  const subheader: string = "Where to Stay";

  return (
    <>
      <Page
        header={locationName}
        subheader={subheader}
        id={WHAT_TO_EAT_ID}
      >
        <h3>What to Eat in {locationName}</h3>
        <div
          className={styles.day_description}
          dangerouslySetInnerHTML={{ __html: whatToEat }}
        />
      </Page>
    </>
  );
}