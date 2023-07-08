import Page from "./Page";
import styles from "./day.module.css";
import { ReactElement } from "react";

export default function NeighborhoodRecommendations({ locationName, neighborhoodRecommendations }): ReactElement {

  const subheader: string = "Where to Stay";
  const markup = { __html: neighborhoodRecommendations };

  return (
    <>
      <Page
        header={locationName}
        subheader={subheader}
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