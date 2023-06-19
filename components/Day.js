import Page from "./Page";
import Itinerary from "./Itinerary";
import styles from "./day.module.css";

function renderWalkingTourLong(tour) {
    if (!tour) return null;
    return (
      <ol>
        {tour.map((step) => <li key={step.name}>{step.name}: {step.desc}</li>)}
      </ol>
    );
  }
export default function Day({activity, food, neighborhood, subheader, locationName}) {
    const {walking_tour, image} = neighborhood;
    let urls = !image ? '' : image.urls;
    return (
        <>
          <Page
            header={locationName}
            subheader={subheader}
          >
            <Itinerary
              activity={activity}
              food={food}
              neighborhood={neighborhood}
            />
          </Page>
          
          <Page
            header={locationName}
            subheader={subheader}
          >
            <h3> {activity.name}</h3>
            {activity.long_desc}
          </Page>

          <Page
            header={locationName}
            subheader={subheader}
          >
            <h3> {neighborhood.name} Walking Tour</h3>
            {renderWalkingTourLong(walking_tour)}

            {urls ? <img className={styles.image} src={urls.regular} /> : null}
            
          </Page>
        </>
    );
}