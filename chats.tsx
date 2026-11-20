import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { channelMeta } from '../../src/channels';
import { formatListTime } from '../../src/dates';
import { useStore } from '../../src/store';
import { colors } from '../../src/theme';

export default function Chats() {
  const { channels, messages } = useStore();
  const router = useRouter();

  const rows = channels.map((id) => {
    const last = [...messages].filter((m) => m.channel === id).sort((a, b) => b.ts - a.ts)[0];
    return { id, meta: channelMeta(id), last };
  });

  rows.sort((a, b) => (b.last?.ts ?? 0) - (a.last?.ts ?? 0));

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={rows}
      keyExtractor={(r) => r.id}
      ItemSeparatorComponent={() => <View style={styles.sep} />}
      renderItem={({ item }) => (
        <Pressable style={styles.row} onPress={() => router.push(`/chat/${item.id}`)}>
          <View style={[styles.avatar, { backgroundColor: item.meta.color }]}>
            <Ionicons name={item.meta.icon} size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.top}>
              <Text style={styles.name}>{item.meta.label}</Text>
              {item.last && <Text style={styles.time}>{formatListTime(item.last.ts)}</Text>}
            </View>
            <Text style={styles.preview} numberOfLines={1}>
              {item.last ? `${item.last.author}: ${item.last.text}` : item.meta.sub}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: colors.card },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  top: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  time: { color: colors.muted, fontSize: 12 },
  preview: { color: colors.muted, marginTop: 3 },
});
