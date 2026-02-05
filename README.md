# SMURD UCP

User Control Panel pentru SMURD - GTA V Roleplay.

## Setup

1. Copiază `.env.example` în `.env` și completează valorile
2. `npm install` (va crea automat folderul auth)
3. `npx prisma db push`
4. `npm run dev`

## Discord OAuth

1. Creează aplicație la https://discord.com/developers/applications
2. Adaugă redirect URI: `http://localhost:3000/api/auth/callback/discord`
3. Copiază Client ID și Secret în `.env`

## Ierarhia Gradelor

| Grad | Indicativ |
|------|-----------|
| Director General | 001-002 |
| Director Adjunct | 003-005 |
| Medic Primar | 006-099 |
| Medic Chirurg | 100-199 |
| Medic Rezident | 200-299 |
| Asistent | 300-399 |
| Paramedic | 400-499 |
| Stagiar | 500-599 |
