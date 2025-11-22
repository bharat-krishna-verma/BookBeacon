import { useUser } from "@clerk/clerk-react";

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();

  return {
    user,
    isLoading: !isLoaded,
    isAuthenticated: isSignedIn,
  };
}
