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
  let urls = !image ? { regular: '' } : image.urls;
  let user = !image ? { username: '', name: '' } : image.user;
  let username: string = !user ? '' : user.username

  const subheader: string = "Day " + (index + 1);

  return (
    <>
      <Page
        header={city}
        subheader={subheader}
        id={DAY_IDS[index]}
      >
        <h3>{activity.name}</h3>
        <h4>In the {neighborhood.name} Neighborhood</h4>
        <div className={styles.day_description}>{activity.long_desc}</div>
        <Itinerary
          activity={activity}
          food={food}
          neighborhood={neighborhood}
        />

        <button className={styles.retryButton} onClick={() => retry(index)}>Regenerate</button>

        <h3>Where to go in {neighborhood.name}</h3>
        {renderWalkingTourLong(walking_tour)}

        {urls ? <img className={styles.image} src={urls.regular} /> : null}
        <a
          className={styles.credit}
          target="_blank"
          href={`https://unsplash.com/@${username}?utm_source=TrippinAI&utm_medium=referral`}
        >
          {user ? user.name : ''}
        </a> on <a className={styles.credit} href="https://unsplash.com?utm_source=TrippinAI&utm_medium=referral">Unsplash</a>
      </Page>
    </>
  );
}