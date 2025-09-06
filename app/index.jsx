import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (isSignedIn) {
    return <Redirect href="/tabs" />;
  } else {
    return <Redirect href="/auth/sign-in" />;
  }
}
