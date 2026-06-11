import { useAppContext } from "@/contexts/AppContext";

export function useCurrentUser() {
  const context = useAppContext();
  return {
    currentUser: context.currentUser,
    isLoading: context.isLoading,
  };
}
