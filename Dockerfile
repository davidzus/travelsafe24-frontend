FROM node:25.9.0-alpine3.22 AS base
RUN npm install -g pnpm@11.1.1


FROM base AS deps
WORKDIR /app/frontend
COPY package*.json .
COPY pnpm*.* .
RUN pnpm install --frozen-lockfile


FROM base AS build
WORKDIR /app/frontend
COPY --from=deps app/frontend/node_modules ./node_modules
COPY . .
RUN pnpm build


FROM base AS prod
WORKDIR /app/frontend
ENV NODE_ENV=production

COPY --from=build /app/frontend/.next/standalone /app/frontend/
COPY --from=build /app/frontend/.next/static ./.next/static
COPY --from=build /app/frontend/public ./public

EXPOSE 3000
CMD [ "node","server.js" ]