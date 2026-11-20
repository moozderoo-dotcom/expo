# Chiro Totem app

Expo (React Native + TypeScript + expo-router) app voor Chiro Totem.

## Wat zit erin

- **Planner**: maandkalender met activiteiten per dag. Leiding kan activiteiten toevoegen en verwijderen, voor iedereen, een groep of enkel de leiding.
- **Chats** (zoals WhatsApp): één community-chat voor iedereen en een chat per groep (Ribbels, Speelclub, Rakwi, Tito, Keti, Aspi).
- **Leidingsgroep**: aparte chat die enkel leiding ziet, plus een overzichtstab (komende vergaderingen, snelkoppelingen).
- **Bestanden** (zoals Drive): mappen per kanaal (Algemeen, groepen, Leidingsgroep). Bestanden uploaden, openen/delen en verwijderen.
- **Profiel**: naam, rol (lid of leiding) en groep. Bepaalt wat je ziet.

## Starten

```bash
npm install
npx expo install --fix   # lijnt de pakketversies uit met je Expo SDK
npx expo start
```

Scan de QR-code met Expo Go (iOS/Android), of druk `a` / `i` / `w` voor emulator of web.

## Belangrijk: dit is een prototype zonder server

Alle data (berichten, activiteiten, bestanden) staat lokaal op het toestel (AsyncStorage). Dat betekent dat
andere gebruikers jouw berichten **niet** zien. Voor een echte groepsapp heb je een backend nodig.
Het meest eenvoudige pad is **Supabase**:

| Onderdeel | Supabase |
| --- | --- |
| Inloggen + rollen (lid/leiding/groep) | Auth + tabel `profiles` |
| Chats in realtime | Postgres + Realtime op tabel `messages` |
| Planner | tabel `events` |
| Bestanden | Storage-buckets per kanaal |
| Wie wat mag zien | Row Level Security-regels |

Alle schermen praten enkel met `src/store.tsx`. Je vervangt daar de lokale opslag door Supabase-calls
zonder de schermen te moeten herschrijven.

## Structuur

```
app/
  _layout.tsx          root + navigatie
  (tabs)/              Planner, Chats, Bestanden, Leiding, Profiel
  chat/[id].tsx        chatscherm (community, groep of leiding)
src/
  store.tsx            state + lokale opslag
  channels.ts          groepen en kanalen
  types.ts, dates.ts, theme.ts, seed.ts
```
