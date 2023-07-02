import Page from "./Page";
import Itinerary from "./Itinerary";
import styles from "./day.module.css";
import { ReactElement } from "react";
import { WalkingTourStep } from "../utils/types";

function renderWalkingTourLong(tour: WalkingTourStep[]): ReactElement {
    if (!tour) return null;
    return (
      <ol>
        {tour.map((step:WalkingTourStep, index) => <li key={index}>{step.name}: {step.desc}</li>)}
      </ol>
    );
  }
export default function Day({activity, food, neighborhood, index, locationName, retry}): ReactElement {
    const {walking_tour, image} = neighborhood;
    let urls = !image ? '' : image.urls;
    let user = !image ? {username: ''} : image.user;
    let username: string = !user ? '' : user.username

    const subheader: string = "Day " + (index + 1);
    return (
        <>
          <Page
            header={locationName}
            subheader={subheader}
          >
            <h3>{activity.name}</h3>
            <h4>In the {neighborhood.name} Neighborhood</h4> 
            <div className={styles.neighboorhood_long_desc}>{activity.long_desc}</div>
            <Itinerary
              activity={activity}
              food={food}
              neighborhood={neighborhood}
            />
            
            <button className={styles.retryButton} onClick={() => retry(index)}>Regenerate</button>
          </Page>

          <Page
            header={locationName}
            subheader={subheader}
          >
            <h3> {neighborhood.name} Walking Tour</h3>
            {renderWalkingTourLong(walking_tour)}

            {urls ? <img className={styles.image} src={urls.regular} /> : null}
            <a
              className={styles.credit}
              target="_blank"
              href={`https://unsplash.com/@${username}?utm_source=TrippinAI&utm_medium=referral`}
            >
              { user ? user.name : ''}
            </a> on <a className={styles.credit} href="https://unsplash.com?utm_source=TrippinAI&utm_medium=referral">Unsplash</a>
          </Page>
        </>
    );
}