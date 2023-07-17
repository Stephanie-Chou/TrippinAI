import Page from "./Page";
import Itinerary from "./Itinerary";
import styles from "./day.module.css";
import { ReactElement } from "react";
import { WalkingTourStep } from "../utils/types";
import { DAY_IDS } from "../utils/constants";

function renderWalkingTourLong(tour: WalkingTourStep[]): ReactElement {
  if (!tour) return null;
  return (
    <ol>
      {tour.map((step: WalkingTourStep, index) => <li key={index}>{step.name}: {step.desc}</li>)}
    </ol>
  );
}
export default function Day({
  activity,
  food,
  neighborhood,
  index,
  city,
  retry }): ReactElement {
  if (!neighborhood) return;
  const { walking_tour, image } = neighborhood;
  const subheader: string = "Day " + (index + 1);
  let urls = !image ? { regular: '' } : image.urls;
  let user = !image ? { username: '', name: '' } : image.user;
  let username: string = !user ? '' : user.username
  return (
    <>
      <Page
        header={city}
        subheader={subheader}
        id={DAY_IDS[index]}
      >
        <h3>{neighborhood.name}<button className={styles.retryButton} onClick={() => retry(index)}><span className="material-symbols-outlined">autorenew</span></button></h3>
        <h4>{activity.name}</h4>
        <div className={styles.day_description}>{activity.long_desc}</div>
        <Itinerary
          activity={activity}
          food={food}
          neighborhood={neighborhood}
        />

        <h4>Where to go in {neighborhood.name}</h4>
        {renderWalkingTourLong(walking_tour)}
      </Page>
    </>
  );
}