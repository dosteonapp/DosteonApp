export interface UserContextType {
  user: User | null | undefined;
  fetchingUser: boolean;
  fetchUserError: boolean;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "OWNER" | "MANAGER" | "CHEF" | "STAFF" | "SUPPLIER";
  created_at?: string | Date;
  onboardingCompleted?: boolean;
  emailVerified?: boolean;
  onboardingSkipped?: boolean;
  organization_id?: string;
  team_id?: string;
  image_url?: string;
}

