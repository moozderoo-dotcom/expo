import { ChannelId, GroupId } from './types';

export const GROUPS: { id: GroupId; label: string; ages: string; color: string }[] = [
  { id: 'ribbels', label: 'Ribbels', ages: '6–8 jaar', color: '#E5A100' },
  { id: 'speelclub', label: 'Speelclub', ages: '8–10 jaar', color: '#2E9E5B' },
  { id: 'rakwi', label: 'Rakwi', ages: '10–12 jaar', color: '#1F8FBF' },
  { id: 'tito', label: 'Tito', ages: '12–14 jaar', color: '#7A4FC4' },
  { id: 'keti', label: 'Keti', ages: '14–16 jaar', color: '#D5202A' },
  { id: 'aspi', label: 'Aspi', ages: '16–18 jaar', color: '#2B2F3A' },
];

export interface ChannelMeta {
  id: ChannelId;
  label: string;
  sub: string;
  color: string;
  icon: 'people' | 'shield-checkmark' | 'chatbubbles';
}

export function channelMeta(id: ChannelId): ChannelMeta {
  if (id === 'community') {
    return { id, label: 'Chiro Totem Community', sub: 'Iedereen', color: '#1F4E9C', icon: 'people' };
  }
  if (id === 'leiding') {
    return { id, label: 'Leidingsgroep', sub: 'Enkel leiding', color: '#163A75', icon: 'shield-checkmark' };
  }
  const g = GROUPS.find((x) => x.id === id)!;
  return { id, label: g.label, sub: g.ages, color: g.color, icon: 'chatbubbles' };
}

export const ALL_CHANNELS: ChannelId[] = ['community', 'leiding', ...GROUPS.map((g) => g.id)];
