import { WHERE_TO_STAY_ID } from "../utils/constants";
import Page from "./Page";
import styles from "./day.module.css";
import { ReactElement } from "react";

export default function NeighborhoodRecommendations({ locationName, whereToStay }): ReactElement {

  const subheader: string = "Where to Stay";
  const markup = { __html: whereToStay };

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
          dangerouslySetInnerHTML={markup}
        />
      </Page>
    </>
  );
}