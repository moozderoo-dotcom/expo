import { addDays, toISO } from './dates';
import { State } from './types';

export function seed(): State {
  const now = Date.now();
  const today = new Date();
  const saturday = addDays(today, (6 - today.getDay() + 7) % 7 || 7);

  return {
    profile: { name: 'Nieuwe leiding', role: 'leiding', group: 'rakwi' },
    messages: [
      { id: 'm1', channel: 'community', author: 'Chiro Totem', authorRole: 'leiding', text: 'Welkom in de Chiro Totem app! 🎉', ts: now - 86400000 * 2 },
      { id: 'm2', channel: 'community', author: 'Sam', authorRole: 'leiding', text: 'Vergeet zaterdag jullie uniform niet mee te brengen.', ts: now - 3600000 * 5 },
      { id: 'm3', channel: 'rakwi', author: 'Lotte', authorRole: 'leiding', text: 'Zaterdag spelen we een bosspel, kledij naar het weer!', ts: now - 3600000 * 3 },
      { id: 'm4', channel: 'leiding', author: 'Sam', authorRole: 'leiding', text: 'Leidingsvergadering is vrijdag om 20u in het lokaal.', ts: now - 3600000 * 8 },
    ],
    events: [
      { id: 'e1', title: 'Chiro-namiddag', date: toISO(saturday), time: '14:00', location: 'Chirolokaal', channel: 'community' },
      { id: 'e2', title: 'Bosspel', date: toISO(saturday), time: '14:00', location: 'Het bos', channel: 'rakwi' },
      { id: 'e3', title: 'Leidingsvergadering', date: toISO(addDays(today, 1)), time: '20:00', location: 'Chirolokaal', channel: 'leiding' },
    ],
    files: [],
  };
}
