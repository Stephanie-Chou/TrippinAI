import Page from "./Page";
import Itinerary from "./Itinerary";

function renderWalkingTourLong(tour) {
    if (!tour) return null;
    return (
      <ol>
        {tour.map((step) => <li key={step.name}>{step.name}: {step.desc}</li>)}
      </ol>
    );
  }
export default function Day({activity, food, neighborhood, subheader, locationName}) {
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
            {renderWalkingTourLong(neighborhood.walking_tour)}
          </Page>
        </>
    );
}