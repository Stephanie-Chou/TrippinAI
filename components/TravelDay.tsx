import { TRAVEL_DAY_ID } from "../utils/constants";
import Page from "./Page";
import styles from "./day.module.css";
import { ReactElement } from "react";

export default function TravelDay({ locationName, travelTips }): ReactElement {

  const subheader: string = "Travel Day";
  const markup = { __html: travelTips };
  return (
    <>
      <Page
        header={locationName}
        subheader={subheader}
        id={TRAVEL_DAY_ID}
      >
        <div
          className={styles.day_description}
          dangerouslySetInnerHTML={markup}
        />
      </Page>
    </>
  );
}