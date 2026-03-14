export interface UserContextType {
  user: User | null | undefined;
  fetchingUser: boolean;
  fetchUserError: boolean;
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "supplier" | "restaurant";
  created_at?: string | Date;
  onboardingCompleted?: boolean;
  emailVerified?: boolean;
  onboardingSkipped?: boolean;
  organization_id?: string;
  team_id?: string;
}

