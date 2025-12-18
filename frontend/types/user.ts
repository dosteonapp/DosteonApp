export interface UserContextType {
  user: User | undefined;
  fetchingUser: boolean;
  fetchUserError: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  onboardingCompleted?: boolean;
  emailVerified?: boolean;
  googleId?: string; // Added this for Google auth
  createdAt?: string | Date;
  updatedAt?: string | Date;
  accountType: "supplier" | "restaurant"; // Required field to track account type
  //   onboardingStatus: OnboardingStatus;
  onboardingSkipped?: boolean;
}
