'use client';

import ListItem from '@/components/ListItem';
import { useAppNavigate } from '@/lib/navigation';

export default function ListItemPage() {
  const navigate = useAppNavigate();
  return <ListItem onNavigate={navigate} />;
}
