export interface UserContextType {
  user: User | undefined;
  fetchingUser: Boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  onboardingCompleted?: boolean;
  emailVerified?: boolean;
  googleId?: string; // Added this for Google auth
  createdAt?: Date;
  updatedAt?: Date;
  accountType: "supplier" | "restaurant"; // Required field to track account type
  //   onboardingStatus: OnboardingStatus;
  onboardingSkipped?: boolean;
}
