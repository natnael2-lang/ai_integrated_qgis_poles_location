# Pole Mapper (Test / Pilot)

Field app that captures a pole's GPS position and photo, sends it to a FastAPI
backend, which stores the photo in Supabase Storage and the record (with a
PostGIS point) in Supabase Postgres — viewable live in QGIS.

## 1. Database setup (Supabase)

1. In Supabase: **Database → Extensions** → enable `postgis`.
2. Open **SQL Editor**, paste and run `database/schema.sql`.
3. In **Storage**, create a bucket named `pole-photos`, mark it **Public** (test only).
4. In **Project Settings → API Keys**, copy the Project URL and anon key.

## 2. Backend setup (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env: fill in SUPABASE_URL and SUPABASE_KEY

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Health check: open `http://127.0.0.1:8000/` — should return `{"status": "ok"}`.

Test the endpoint directly:

```bash
curl -X POST "http://127.0.0.1:8000/upload-pole" \
  -F "lat=9.0192" \
  -F "lon=38.7469" \
  -F "accuracy_m=4.5" \
  -F "pole_code=P-TEST-01" \
  -F "condition=good" \
  -F "device_timestamp=2026-09-11T10:00:00Z" \
  -F "photo=@/path/to/test-photo.jpg"
```

## 3. Mobile app setup (React Native / Expo)

```bash
cd mobile-app
npm install
```

Edit `config/constants.js` and set `API_URL` to your **laptop's local network IP**
(not `localhost` — the phone is a separate device on the same Wi-Fi):

```js
export const API_URL = 'http://192.168.1.100:8000/upload-pole';
```

Find your local IP:
- Mac/Linux: `ifconfig | grep "inet "`
- Windows: `ipconfig`

Run the app:

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone (same Wi-Fi network as
your laptop).

## 4. Verify end-to-end

1. In the app: enter a pole code, tap **Capture Location**, tap **Take Photo**, tap **Submit Pole**.
2. In Supabase **Storage → pole-photos**: the photo should appear.
3. In Supabase **Table Editor → poles**: a new row should appear with a `geom` value.
4. In QGIS: refresh the `poles` PostGIS layer (or re-add it) — the new point should appear on the map.

## 5. Moving beyond local testing

- Deploy `backend/` to Render (or similar) so the phone can reach the API over
  the internet instead of only local Wi-Fi — then update `API_URL` to the
  deployed URL.
- Switch the Supabase Storage bucket to **private** and serve signed URLs
  instead of public ones.
- Add authentication (per-device tokens) before letting real field workers submit data.
- Add the mock-location / impossible-jump / photo-EXIF checks discussed
  earlier before trusting submissions for real asset records.

## Folder structure

```
pole-mapper-project/
├── mobile-app/        React Native (Expo) field app
├── backend/            FastAPI server (validation, Supabase Storage + DB writes)
├── database/           schema.sql — table definition + sample rows
└── README.md
```
