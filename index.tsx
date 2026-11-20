import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { channelMeta } from '../../src/channels';
import { DAYS_SHORT, MONTHS, formatDayLong, toISO } from '../../src/dates';
import { useStore } from '../../src/store';
import { colors } from '../../src/theme';
import { ChannelId } from '../../src/types';

export default function Planner() {
  const { events, canAccess, channels, profile, addEvent, deleteEvent } = useStore();
  const isLeiding = profile.role === 'leiding';
  const today = toISO(new Date());

  const [cursor, setCursor] = useState(() => ({ y: new Date().getFullYear(), m: new Date().getMonth() }));
  const [selected, setSelected] = useState(today);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('14:00');
  const [location, setLocation] = useState('');
  const [channel, setChannel] = useState<ChannelId>('community');

  const visible = useMemo(() => events.filter((e) => canAccess(e.channel)), [events, canAccess]);
  const countByDate = useMemo(() => {
    const m: Record<string, number> = {};
    visible.forEach((e) => (m[e.date] = (m[e.date] || 0) + 1));
    return m;
  }, [visible]);

  const dayEvents = visible
    .filter((e) => e.date === selected)
    .sort((a, b) => a.time.localeCompare(b.time));

  const offset = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shift = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const save = () => {
    if (!title.trim()) return;
    addEvent({ title: title.trim(), date: selected, time: time.trim() || '00:00', location: location.trim(), channel });
    setTitle('');
    setLocation('');
    setOpen(false);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}>
          <View style={styles.monthRow}>
            <Pressable onPress={() => shift(-1)} hitSlop={10}>
              <Ionicons name="chevron-back" size={24} color={colors.blue} />
            </Pressable>
            <Text style={styles.monthText}>
              {MONTHS[cursor.m]} {cursor.y}
            </Text>
            <Pressable onPress={() => shift(1)} hitSlop={10}>
              <Ionicons name="chevron-forward" size={24} color={colors.blue} />
            </Pressable>
          </View>

          <View style={styles.grid}>
            {DAYS_SHORT.map((d) => (
              <Text key={d} style={styles.dow}>
                {d}
              </Text>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <View key={`x${i}`} style={styles.cell} />;
              const iso = toISO(new Date(cursor.y, cursor.m, day));
              const isSel = iso === selected;
              const isToday = iso === today;
              return (
                <Pressable key={iso} style={styles.cell} onPress={() => setSelected(iso)}>
                  <View style={[styles.dayBubble, isSel && styles.daySel, !isSel && isToday && styles.dayToday]}>
                    <Text style={[styles.dayText, isSel && { color: '#fff', fontWeight: '700' }]}>{day}</Text>
                  </View>
                  <View style={[styles.dot, { opacity: countByDate[iso] ? 1 : 0 }]} />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{formatDayLong(selected)}</Text>
          {isLeiding && (
            <Pressable
              style={styles.addBtn}
              onPress={() => {
                setChannel(channels[0] ?? 'community');
                setOpen(true);
              }}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addBtnText}>Activiteit</Text>
            </Pressable>
          )}
        </View>

        {dayEvents.length === 0 && <Text style={styles.empty}>Geen activiteiten op deze dag.</Text>}

        {dayEvents.map((e) => {
          const meta = channelMeta(e.channel);
          return (
            <View key={e.id} style={[styles.event, { borderLeftColor: meta.color }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventTime}>{e.time}</Text>
                <Text style={styles.eventTitle}>{e.title}</Text>
                {!!e.location && (
                  <Text style={styles.eventSub}>
                    <Ionicons name="location-outline" size={12} /> {e.location}
                  </Text>
                )}
                <Text style={[styles.badge, { color: meta.color }]}>{meta.label}</Text>
              </View>
              {isLeiding && (
                <Pressable onPress={() => deleteEvent(e.id)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={20} color={colors.muted} />
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalWrap}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Nieuwe activiteit</Text>
            <Text style={styles.sheetSub}>{formatDayLong(selected)}</Text>

            <TextInput style={styles.input} placeholder="Titel" value={title} onChangeText={setTitle} />
            <TextInput
              style={styles.input}
              placeholder="Uur (bv. 14:00)"
              value={time}
              onChangeText={setTime}
              keyboardType="numbers-and-punctuation"
            />
            <TextInput style={styles.input} placeholder="Locatie" value={location} onChangeText={setLocation} />

            <Text style={styles.label}>Voor wie?</Text>
            <View style={styles.chips}>
              {channels.map((c) => {
                const m = channelMeta(c);
                const on = c === channel;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setChannel(c)}
                    style={[styles.chip, on && { backgroundColor: m.color, borderColor: m.color }]}
                  >
                    <Text style={[styles.chipText, on && { color: '#fff' }]}>
                      {c === 'community' ? 'Iedereen' : m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.sheetButtons}>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => setOpen(false)}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>Annuleren</Text>
              </Pressable>
              <Pressable style={styles.btn} onPress={save}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Opslaan</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 12 },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  monthText: { fontSize: 18, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dow: { width: '14.2857%', textAlign: 'center', color: colors.muted, fontSize: 12, marginBottom: 4 },
  cell: { width: '14.2857%', alignItems: 'center', paddingVertical: 3 },
  dayBubble: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  daySel: { backgroundColor: colors.blue },
  dayToday: { borderWidth: 1.5, borderColor: colors.red },
  dayText: { color: colors.text, fontSize: 15 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.red, marginTop: 2 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 8 },
  listTitle: { fontSize: 17, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.red, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  addBtnText: { color: '#fff', fontWeight: '700', marginLeft: 2 },
  empty: { color: colors.muted, marginTop: 8 },
  event: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 5 },
  eventTime: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  eventTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 2 },
  eventSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  badge: { fontSize: 12, fontWeight: '700', marginTop: 6 },
  modalWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  sheetSub: { color: colors.muted, marginBottom: 12, textTransform: 'capitalize' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 16 },
  label: { fontWeight: '700', color: colors.text, marginVertical: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  sheetButtons: { flexDirection: 'row', gap: 10, marginTop: 18 },
  btn: { flex: 1, backgroundColor: colors.blue, borderRadius: 12, padding: 14, alignItems: 'center' },
  btnGhost: { backgroundColor: colors.bg },
});
