# NAVSA Mobile (Sarajevo Javni Prevoz Uživo)

Modern, touch-first mobile web application for real-time tracking of public transport in Sarajevo (Tramvaji, Trolejbusi, Autobusi).

Powered by live data from Sarajevo public transport telemetry (`navsa.spatias.com` & Javni Prevoz KS).

---

## 🌟 Ključne Funkcije (Key Features)

1. **Dozvola za Lokaciju & Praćenje (Location Permission & Proximity)**
   - Traži dozvolu za GPS geolokaciju kako bi prikazao vašu tačnu poziciju na mapi.
   - Ako je GPS isključen ili ste u zatvorenom prostoru, na raspolaganju su predefinisane sarajevske stanice (Marijin Dvor, Baščaršija, Čengić Vila, Otoka, Dobrinja, Jezero, Ilidža, Trg Austrije, itd.).

2. **Smjer i Prikaz Kretanja (Ingoing vs Outgoing Direction Markers)**
   - Jasno označava smjer kretanja i krajnje odredište:
     - Npr. **DOBRINJA ➔ JEZERO** (Linija 107) ili **JEZERO ➔ DOBRINJA**
     - Npr. **ILIDŽA ➔ BAŠČARŠIJA** (Linija 3) ili **BAŠČARŠIJA ➔ ILIDŽA**
   - **Status prema vašoj poziciji**:
     - 🟢 **Dolazi prema vama (Ingoing)**: Vozilo se kreće prema vašoj stanici/lokaciji sa procijenjenim vremenom dolaska (ETA u minutama) i udaljenošću u metrima.
     - 🔴 **Odlazi od vas (Outgoing)**: Vozilo se udaljava ili kreće u suprotnom smjeru.

3. **Uživo Praćenje & Osvježavanje (Live Tracking & Auto-Refresh)**
   - Automatsko osvježavanje svakih 10 sekundi sa animiranom trakom napretka (progress bar).
   - Dugme za trenutno ručno osvježavanje.
   - Rotirajuće strelice na mapi koje pokazuju tačan smjer (bearing) kretanja vozila.
   - Pulsirajući zeleni krug oko vozila koja se približavaju.

4. **Tamna i Svijetla Tema (Dark & Light Mode)**
   - Brza promjena teme pritiskom na ikonu Sunce/Mjesec.
   - Mapa i korisnički interfejs se prilagođavaju u realnom vremenu (tamne canvas i svijetle canvas karte bez vodenih žigova).

5. **Interaktivna Donja Ladica (Bottom Sheet & Filteri)**
   - Pregled svih vozila u blizini.
   - Filteri: Sva vozila, Samo dolazeća, Tramvaji, Trolejbusi, Autobusi.
   - Pretraga po broju linije (npr. `107`, `3`, `31E`) ili odredištu (npr. `Jezero`, `Dobrinja`, `Ilidža`).
   - Detaljan modal za svako vozilo: registracija / garažni broj, operater (GRAS / Centrotrans), procijenjena brzina, smjer i dugme "Prikaži na mapi".

---

## 🚀 Pokretanje (Quick Start)

### Razvojni server (Dev Server):
```bash
npm install
npm run dev
```
Aplikacija se pokreće na: `http://localhost:5173/`

### Produkcijski build:
```bash
npm run build
npm run preview
```

### Pokretanje na mobilnom uređaju:
Aplikacija je responzivna i prilagođena mobilnim ekranima. Možete je otvoriti u pregledniku telefona ili povezati telefon putem ADB:
```bash
adb reverse tcp:5173 tcp:5173
adb shell am start -a android.intent.action.VIEW -d "http://localhost:5173"
```
