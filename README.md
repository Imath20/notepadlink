# Notepad Share

O aplicație web pentru crearea și partajarea notelor cu linkuri personalizate, similar cu notepad.pw.

## Funcționalități

- ✨ **Editor text avansat** cu formatare (bold, italic, underline, strikethrough)
- 🎨 **Personalizare font** - familie, mărime, culoare text și background
- 📝 **Liste ordonate și neordonate**
- 🔗 **Linkuri personalizate** - poți alege extensia link-ului tău
- 💾 **Salvare automată** pentru note existente
- 📱 **Design responsive** pentru toate dispozitivele
- 🚀 **Interfață modernă** cu efecte glassmorphism

## Instalare și rulare

1. **Instalează dependențele:**
   ```bash
   npm install
   ```

2. **Pornește serverul:**
   ```bash
   npm start
   ```
   
   Pentru dezvoltare cu auto-reload:
   ```bash
   npm run dev
   ```

3. **Deschide aplicația:**
   Navighează la `http://localhost:3000`

## Utilizare

1. **Scrie conținutul** în editorul principal
2. **Formatează textul** folosind toolbar-ul (bold, italic, fonturi, culori, etc.)
3. **Alege o extensie personalizată** (opțional) - de ex. `notepad.pw/mi-nota`
4. **Salvează** și primești un link partajabil
5. **Partajează link-ul** cu oricine - ei vor putea vedea și edita nota

## Shortcut-uri tastatură

- `Ctrl/Cmd + S` - Salvează nota
- `Ctrl/Cmd + N` - Creează o notă nouă

## API Endpoints

- `POST /api/notes` - Creează o notă nouă
- `GET /api/notes/:id` - Obține o notă după ID
- `PUT /api/notes/:id` - Actualizează o notă existentă
- `GET /api/check/:extension` - Verifică disponibilitatea unei extensii
- `GET /note/:id` - Pagina pentru vizualizarea unei note

## Tehnologii folosite

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Storage:** In-memory (pentru demo - în producție folosești o bază de date)
- **UI/UX:** Design modern cu glassmorphism și animații fluide

## Structura proiectului

```
notepad/
├── server.js          # Server Express.js
├── package.json       # Dependențe și scripturi
├── public/           # Fișiere frontend
│   ├── index.html    # Pagina principală
│   ├── styles.css    # Stiluri CSS
│   └── script.js     # Logica JavaScript
└── README.md         # Documentația
```

## Dezvoltare viitoare

- [ ] Integrare cu baza de date (MongoDB/PostgreSQL)
- [ ] Autentificare utilizatori
- [ ] Note private vs. publice
- [ ] Istoric modificări
- [ ] Export în PDF/Word
- [ ] Colaborare în timp real
- [ ] API pentru integrare cu alte aplicații

## Licență

MIT License - folosește liber pentru proiecte personale și comerciale.
