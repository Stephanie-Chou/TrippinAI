export interface WalkingTourStep {
  name: string,
  desc: string,
};

export interface DayTrip {
  name: string,
  short_desc: string,
  long_desc: string,
  food: {
    name: string,
    desc: string,
  },
  image: Photo,
}

export interface Activity {
  name: string,
  short_desc: string,
  long_desc: string,
}

export interface Neighborhood {
  name: string,
  walking_tour: WalkingTourStep[],
  image: Photo,
}

export interface Food {
  lunch: { name: string, desc: string },
  dinner: { name: string, desc: string },
}

export interface Meta {
  dayTrips: string[],
  activities: string[],
  foods: string[],
  neighborhoods: string[],
}

export interface Photo {
  id: number;
  width: number;
  height: number;
  urls: { large: string; regular: string; raw: string; small: string };
  color: string | null;
  user: {
    username: string;
    name: string;
  };
}

export interface RetryDay {
  activity: string,
  neighborhood: string,
}

// Loading States
export interface LoadingState {
  days: boolean,
  dayTrips: boolean,
};