import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, FlatList, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { channelMeta } from '../../src/channels';
import { formatSize, toISO } from '../../src/dates';
import { useStore } from '../../src/store';
import { colors } from '../../src/theme';
import { ChannelId } from '../../src/types';

function fileIcon(name: string, mime?: string): React.ComponentProps<typeof Ionicons>['name'] {
  const n = name.toLowerCase();
  if (mime?.startsWith('image/')) return 'image-outline';
  if (n.endsWith('.pdf')) return 'document-text-outline';
  if (/\.(docx?|odt)$/.test(n)) return 'document-outline';
  if (/\.(xlsx?|csv)$/.test(n)) return 'grid-outline';
  if (/\.(pptx?)$/.test(n)) return 'easel-outline';
  return 'attach-outline';
}

export default function Bestanden() {
  const { channels, files, addFile, deleteFile, profile } = useStore();
  const [folder, setFolder] = useState<ChannelId>(channels[0] ?? 'community');
  const current = channels.includes(folder) ? folder : 'community';
  const list = files.filter((f) => f.channel === current);

  const upload = async () => {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: true });
    if (res.canceled) return;
    res.assets.forEach((a) =>
      addFile({ name: a.name, size: a.size, uri: a.uri, mime: a.mimeType, channel: current })
    );
  };

  const openFile = async (uri: string) => {
    try {
      if (Platform.OS === 'web') return Linking.openURL(uri);
      if (await Sharing.isAvailableAsync()) return Sharing.shareAsync(uri);
      Linking.openURL(uri);
    } catch {
      Alert.alert('Openen mislukt', 'Dit bestand kon niet geopend worden.');
    }
  };

  const confirmDelete = (id: string, name: string) =>
    Alert.alert('Bestand verwijderen', `“${name}” verwijderen?`, [
      { text: 'Annuleren', style: 'cancel' },
      { text: 'Verwijderen', style: 'destructive', onPress: () => deleteFile(id) },
    ]);

  return (
    <View style={styles.screen}>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.folders}>
          {channels.map((c) => {
            const m = channelMeta(c);
            const on = c === current;
            return (
              <Pressable
                key={c}
                onPress={() => setFolder(c)}
                style={[styles.folder, on && { backgroundColor: m.color, borderColor: m.color }]}
              >
                <Ionicons name={on ? 'folder-open' : 'folder'} size={16} color={on ? '#fff' : m.color} />
                <Text style={[styles.folderText, on && { color: '#fff' }]}>
                  {c === 'community' ? 'Algemeen' : m.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={list}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Nog geen bestanden in deze map. Tik op + om iets toe te voegen.</Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.file} onPress={() => openFile(item.uri)}>
            <View style={styles.fileIcon}>
              <Ionicons name={fileIcon(item.name, item.mime)} size={24} color={colors.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fileName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.fileSub}>
                {[formatSize(item.size), item.uploader, toISO(new Date(item.ts))].filter(Boolean).join(' · ')}
              </Text>
            </View>
            {(profile.role === 'leiding' || item.uploader === profile.name) && (
              <Pressable onPress={() => confirmDelete(item.id, item.name)} hitSlop={10}>
                <Ionicons name="trash-outline" size={20} color={colors.muted} />
              </Pressable>
            )}
          </Pressable>
        )}
      />

      <Pressable style={styles.fab} onPress={upload}>
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  folders: { padding: 12, gap: 8 },
  folder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  folderText: { fontWeight: '600', color: colors.text },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 40 },
  file: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 10 },
  fileIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#E8EEF9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  fileName: { fontSize: 15, fontWeight: '600', color: colors.text },
  fileSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
