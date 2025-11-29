export interface ITraveler {
  id?: string;
  name: string;
  email: string;
  contactNumber?: string;
  address?: string;
  profileImage?: string;
  bio?: string;
  travelInterests: string[];
  visitedCountries: string[];
  currentLocation?: string;
}
