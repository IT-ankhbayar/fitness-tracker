// DEPRECATED: This file is superseded by folder-based route app/(tabs)/history/index.tsx
// We keep a redirect here to avoid route duplication issues when both exist.
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function DeprecatedHistoryScreen() {
  useEffect(() => {
    router.replace('/history' as any);
  }, []);
  return null;
}
