import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { channelMeta } from '../../src/channels';
import { formatTime } from '../../src/dates';
import { useStore } from '../../src/store';
import { colors } from '../../src/theme';
import { ChannelId } from '../../src/types';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const channel = id as ChannelId;
  const { messages, profile, sendMessage, canAccess } = useStore();
  const [text, setText] = useState('');

  const meta = channelMeta(channel);

  if (!canAccess(channel)) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Geen toegang' }} />
        <Text style={{ color: colors.muted }}>Je hebt geen toegang tot deze chat.</Text>
      </View>
    );
  }

  const data = messages.filter((m) => m.channel === channel).sort((a, b) => b.ts - a.ts); // inverted list

  const send = () => {
    const t = text.trim();
    if (!t) return;
    sendMessage(channel, t);
    setText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen options={{ title: meta.label }} />
      <FlatList
        inverted
        data={data}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={
          <Text style={[styles.empty, { transform: [{ scaleY: -1 }] }]}>Nog geen berichten. Zeg eens hallo! 👋</Text>
        }
        renderItem={({ item }) => {
          const mine = item.author === profile.name;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              {!mine && (
                <Text style={styles.author}>
                  {item.author}
                  {item.authorRole === 'leiding' ? ' · leiding' : ''}
                </Text>
              )}
              <Text style={{ color: mine ? '#fff' : colors.text, fontSize: 16 }}>{item.text}</Text>
              <Text style={[styles.time, mine && { color: 'rgba(255,255,255,0.7)' }]}>{formatTime(item.ts)}</Text>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Typ een bericht"
          value={text}
          onChangeText={setText}
          multiline
        />
        <Pressable style={styles.send} onPress={send}>
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E9EEF7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  bubble: { maxWidth: '82%', borderRadius: 14, padding: 10, marginVertical: 3 },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.blue, borderBottomRightRadius: 4 },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  author: { fontSize: 12, fontWeight: '700', color: colors.red, marginBottom: 2 },
  time: { fontSize: 11, color: colors.muted, alignSelf: 'flex-end', marginTop: 3 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 8, backgroundColor: '#fff' },
  input: {
    flex: 1,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: colors.bg,
  },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
