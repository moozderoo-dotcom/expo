import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GROUPS } from '../../src/channels';
import { useStore } from '../../src/store';
import { colors } from '../../src/theme';

export default function Profiel() {
  const { profile, setProfile } = useStore();

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Naam</Text>
      <TextInput
        style={styles.input}
        value={profile.name}
        onChangeText={(name) => setProfile({ name })}
        placeholder="Jouw naam"
      />

      <Text style={styles.label}>Ik ben</Text>
      <View style={styles.row}>
        {(['lid', 'leiding'] as const).map((r) => (
          <Pressable
            key={r}
            style={[styles.seg, profile.role === r && styles.segOn]}
            onPress={() => setProfile({ role: r })}
          >
            <Text style={[styles.segText, profile.role === r && { color: '#fff' }]}>
              {r === 'lid' ? 'Lid / ouder' : 'Leiding'}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>{profile.role === 'leiding' ? 'Mijn groep' : 'Groep van mijn kind'}</Text>
      <View style={styles.chips}>
        {GROUPS.map((g) => {
          const on = profile.group === g.id;
          return (
            <Pressable
              key={g.id}
              style={[styles.chip, on && { backgroundColor: g.color, borderColor: g.color }]}
              onPress={() => setProfile({ group: g.id })}
            >
              <Text style={[styles.chipText, on && { color: '#fff' }]}>
                {g.label} · {g.ages}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.note}>
        Leiding ziet alle groepen, de leidingsgroep en kan activiteiten plannen. Leden zien de community en de chat van
        hun eigen groep. Rollen zijn voorlopig vrij te kiezen; met een echte backend wordt dit door een beheerder
        toegekend.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: '700', color: colors.text, marginTop: 18, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 16 },
  row: { flexDirection: 'row', gap: 10 },
  seg: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  segOn: { backgroundColor: colors.blue, borderColor: colors.blue },
  segText: { fontWeight: '700', color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  chipText: { fontWeight: '600', color: colors.text, fontSize: 13 },
  note: { color: colors.muted, marginTop: 28, lineHeight: 20 },
});
