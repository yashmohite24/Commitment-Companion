import { Redirect } from 'expo-router';

/** /challenge → main Challenges list (common typo / short link). */
export default function ChallengeIndex() {
  return <Redirect href="/challenges" />;
}
