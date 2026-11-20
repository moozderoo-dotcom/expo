import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ALL_CHANNELS } from './channels';
import { seed } from './seed';
import { ChannelId, EventItem, FileItem, Message, Profile, State } from './types';

const KEY = 'chiro-totem-v1';

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

interface Store extends State {
  ready: boolean;
  channels: ChannelId[]; // kanalen waartoe deze gebruiker toegang heeft
  canAccess: (c: ChannelId) => boolean;
  setProfile: (p: Partial<Profile>) => void;
  sendMessage: (channel: ChannelId, text: string) => void;
  addEvent: (e: Omit<EventItem, 'id'>) => void;
  deleteEvent: (id: string) => void;
  addFile: (f: Omit<FileItem, 'id' | 'ts' | 'uploader'>) => void;
  deleteFile: (id: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(seed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          try {
            setState(JSON.parse(raw));
          } catch {}
        }
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const { profile } = state;

  const canAccess = useCallback(
    (c: ChannelId) => {
      if (c === 'community') return true;
      if (c === 'leiding') return profile.role === 'leiding';
      return profile.role === 'leiding' || profile.group === c;
    },
    [profile.role, profile.group]
  );

  const value = useMemo<Store>(
    () => ({
      ...state,
      ready,
      canAccess,
      channels: ALL_CHANNELS.filter(canAccess),
      setProfile: (p) => setState((s) => ({ ...s, profile: { ...s.profile, ...p } })),
      sendMessage: (channel, text) =>
        setState((s) => {
          const msg: Message = {
            id: uid(),
            channel,
            author: s.profile.name || 'Onbekend',
            authorRole: s.profile.role,
            text,
            ts: Date.now(),
          };
          return { ...s, messages: [...s.messages, msg] };
        }),
      addEvent: (e) => setState((s) => ({ ...s, events: [...s.events, { ...e, id: uid() }] })),
      deleteEvent: (id) => setState((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) })),
      addFile: (f) =>
        setState((s) => ({
          ...s,
          files: [{ ...f, id: uid(), ts: Date.now(), uploader: s.profile.name }, ...s.files],
        })),
      deleteFile: (id) => setState((s) => ({ ...s, files: s.files.filter((f) => f.id !== id) })),
    }),
    [state, ready, canAccess]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore buiten StoreProvider');
  return v;
}
