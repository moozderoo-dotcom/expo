import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GROUPS } from '../../src/channels';
import { formatDayLong, toISO } from '../../src/dates';
import { useStore } from '../../src/store';
import { colors } from '../../src/theme';

export default function Leiding() {
  const { events, messages, files } = useStore();
  const router = useRouter();
  const today = toISO(new Date());

  const upcoming = events
    .filter((e) => e.channel === 'leiding' && e.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5);

  const lastMsg = [...messages].filter((m) => m.channel === 'leiding').sort((a, b) => b.ts - a.ts)[0];
  const fileCount = files.filter((f) => f.channel === 'leiding').length;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Pressable style={styles.hero} onPress={() => router.push('/chat/leiding')}>
        <Ionicons name="shield-checkmark" size={32} color="#fff" />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.heroTitle}>Leidingsgroep</Text>
          <Text style={styles.heroSub} numberOfLines={1}>
            {lastMsg ? `${lastMsg.author}: ${lastMsg.text}` : 'Nog geen berichten'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#fff" />
      </Pressable>

      <Text style={styles.h}>Komende leidingsmomenten</Text>
      {upcoming.length === 0 && <Text style={styles.muted}>Niets gepland.</Text>}
      {upcoming.map((e) => (
        <View key={e.id} style={styles.row}>
          <Text style={styles.rowTitle}>{e.title}</Text>
          <Text style={styles.muted}>
            {formatDayLong(e.date)} · {e.time} {e.location ? `· ${e.location}` : ''}
          </Text>
        </View>
      ))}

      <Text style={styles.h}>Leiding-bestanden</Text>
      <Text style={styles.muted}>
        {fileCount} bestand{fileCount === 1 ? '' : 'en'} in de map Leidingsgroep (tab Bestanden).
      </Text>

      <Text style={styles.h}>Groepschats</Text>
      <View style={styles.chips}>
        {GROUPS.map((g) => (
          <Pressable
            key={g.id}
            style={[styles.chip, { backgroundColor: g.color }]}
            onPress={() => router.push(`/chat/${g.id}`)}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>{g.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.blue, borderRadius: 16, padding: 18 },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  h: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 24, marginBottom: 8 },
  muted: { color: colors.muted },
  row: { backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 8 },
  rowTitle: { fontWeight: '700', color: colors.text, marginBottom: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
});
