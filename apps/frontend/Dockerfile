FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json next.config.js tailwind.config.ts postcss.config.js ./
COPY src ./src
COPY public ./public
RUN npm run build

# ---

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.js ./

EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
