export interface ITraveler {
  id?: string;
  name: string;
  email: string;
  password: string;
  contactNumber?: string;
  address?: string;
  profileImage?: string;
  bio?: string;
  travelInterests: string[];
  visitedCountries: string[];
  currentLocation?: string;
}
