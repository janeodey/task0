# 🚀 Profile Classification API (Stage 1 Backend)

A backend API that accepts a name, integrates with multiple external APIs, processes the data, stores it, and exposes endpoints to manage profiles.

---

## 📌 Overview

This API:

- Accepts a name input
- Calls three external APIs:

  - Gender prediction
  - Age estimation
  - Nationality prediction

- Aggregates and processes the data
- Stores the result
- Prevents duplicate entries (idempotency)
- Provides endpoints to retrieve and manage stored profiles

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- Axios
- UUID v7
- In-memory storage (array)

---

## 🌍 External APIs Used

- Genderize API → https://api.genderize.io
- Agify API → https://api.agify.io
- Nationalize API → https://api.nationalize.io

---

## ⚙️ Installation & Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

2. Install dependencies:

```bash
npm install
```

3. Run the server:

```bash
node index.js
```

4. Server will start at:

```bash
http://localhost:3000
```

---

## 📡 API Endpoints

---

### 1. Create Profile

**POST** `/api/profiles`

#### Request Body:

```json
{
  "name": "ella"
}
```

#### Success Response (201):

```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "NG",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00Z"
  }
}
```

#### Idempotency Response:

```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": { ... }
}
```

---

### 2. Get All Profiles

**GET** `/api/profiles`

#### Optional Query Parameters:

- `gender`
- `country_id`
- `age_group`

#### Example:

```
/api/profiles?gender=female&country_id=NG
```

#### Response:

```json
{
  "status": "success",
  "count": 2,
  "data": [
    {
      "id": "id-1",
      "name": "ella",
      "gender": "female",
      "age": 46,
      "age_group": "adult",
      "country_id": "NG"
    }
  ]
}
```

---

### 3. Get Single Profile

**GET** `/api/profiles/:id`

#### Response:

```json
{
  "status": "success",
  "data": { ...profile }
}
```

---

### 4. Delete Profile

**DELETE** `/api/profiles/:id`

#### Response:

- `204 No Content`

---

## 🧠 Data Processing Logic

- **Gender**

  - Extracted from Genderize API
  - Includes probability and sample size

- **Age Group Classification**

  - 0–12 → child
  - 13–19 → teenager
  - 20–59 → adult
  - 60+ → senior

- **Nationality**

  - Selects the country with the highest probability

---

## 🔁 Idempotency

- Submitting the same name multiple times will not create duplicates
- Existing profile is returned instead

---

## ⚠️ Error Handling

All errors follow this structure:

```json
{
  "status": "error",
  "message": "Error message"
}
```

### Status Codes:

- `400` → Missing or empty name
- `422` → Invalid input type
- `404` → Profile not found
- `502` → External API failure
- `500` → Internal server error

---

## 🧪 Testing

You can test the API using:

- Postman
- Thunder Client
- Curl

---

## 🚀 Deployment

The API is deployed and accessible via:

```
https://your-deployment-url.com
```

---

## 📌 Notes

- All timestamps are in UTC (ISO 8601 format)
- All IDs are generated using UUID v7
- Data is stored in-memory (resets on server restart)

---

## 👤 Author

Built by Jane 🚀
