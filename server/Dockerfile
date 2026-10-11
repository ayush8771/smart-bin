FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# serviceAccountKey.json must NOT be present in the deploy context.
# Credentials are injected via FIREBASE_CREDS env var at runtime.

ENV PORT=5000
EXPOSE 5000

CMD ["node", "index.js"]
