import Page from "./Page";
import styles from "./day.module.css";
import { ReactElement } from "react";

export default function TravelDay({ locationName, travelTips }): ReactElement {

  const subheader: string = "Travel Day";
  return (
    <>
      <Page
        header={locationName}
        subheader={subheader}
      >
        <h3>Getting to {locationName}</h3>
        <div className={styles.day_description}>
          <pre>{travelTips}</pre>
        </div>
      </Page>
    </>
  );
}