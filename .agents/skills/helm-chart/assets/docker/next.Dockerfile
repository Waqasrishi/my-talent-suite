# syntax=docker/dockerfile:1
# Written by the helm-chart skill. Canvas never reads it: on Canvas, buildpacks build the app.
# Build from the app's folder (a pair: from web/):
#   docker build -f custom-deploy/docker/Dockerfile -t <registry>/<app>:<tag> .
# The same start command (the Procfile) and the same user (1002:1000) as Canvas, so the chart's
# read-only, non-root settings hold.
ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-slim AS build
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /workspace
# Dependencies first, so a code change does not reinstall them. The platform's packages are
# vendored in packages/ (never npm).
COPY package.json package-lock.json ./
COPY packages/ packages/
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:${NODE_VERSION}-slim
# HOME on the writable /tmp: the root filesystem is read-only.
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080 HOME=/tmp
WORKDIR /workspace
COPY --from=build --chown=1002:1000 /workspace /workspace
USER 1002:1000
EXPOSE 8080
# node_modules/.bin, not npm start: npm writes to a home folder.
CMD ["node_modules/.bin/next", "start", "-H", "0.0.0.0"]
