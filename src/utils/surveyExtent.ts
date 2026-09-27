interface ObservationSiteCoordinates {
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface SurveyExtent {
  west: number;
  east: number;
  south: number;
  north: number;
}

export const deriveExtent = (observationSites: ObservationSiteCoordinates[]): SurveyExtent | undefined => {
  if (observationSites.length === 0) return undefined;

  const longitudes = observationSites.map(({ coordinates }) => coordinates.longitude);
  const latitudes = observationSites.map(({ coordinates }) => coordinates.latitude);

  return {
    west: Math.min(...longitudes),
    east: Math.max(...longitudes),
    south: Math.min(...latitudes),
    north: Math.max(...latitudes),
  };
};
