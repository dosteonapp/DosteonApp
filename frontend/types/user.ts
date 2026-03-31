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
  // DB role values — display names map to:
  //   OWNER   → Owner         (full access + settings)
  //   MANAGER → Manager       (full access + settings)
  //   CHEF    → Procurement Officer (inventory write + kitchen)
  //   STAFF   → Kitchen Staff (kitchen only, read-only inventory)
  role: "OWNER" | "MANAGER" | "CHEF" | "STAFF" | "SUPPLIER";
  created_at?: string | Date;
  onboardingCompleted?: boolean;
  emailVerified?: boolean;
  onboardingSkipped?: boolean;
  organization_id?: string;
  team_id?: string;
  image_url?: string;
  avatar_url?: string;
  password_changed_at?: string;
}

