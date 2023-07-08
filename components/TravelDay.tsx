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
      >
        <div
          className={styles.day_description}
          dangerouslySetInnerHTML={markup}
        />
      </Page>
    </>
  );
}