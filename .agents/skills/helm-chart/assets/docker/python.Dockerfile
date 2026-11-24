# syntax=docker/dockerfile:1
# Written by the helm-chart skill. Canvas never reads it: on Canvas, buildpacks build the app.
# Build from the app's folder (a pair: from api/):
#   docker build -f custom-deploy/docker/Dockerfile -t <registry>/<app>:<tag> .
# The same Python, the same start command (the Procfile) and the same user (1002:1000) as Canvas,
# so the chart's read-only, non-root settings hold.
ARG PYTHON_VERSION=3.14.7

FROM ghcr.io/astral-sh/uv:0.12.23 AS uv

FROM python:${PYTHON_VERSION}-slim AS build
COPY --from=uv /uv /usr/local/bin/uv
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=never
WORKDIR /workspace
# Dependencies first, so a code change does not reinstall them. The platform's packages are
# vendored in packages/ (never PyPI).
COPY pyproject.toml uv.lock ./
COPY packages/ packages/
RUN uv sync --frozen --no-dev --no-install-project
COPY . .
RUN uv sync --frozen --no-dev

FROM python:${PYTHON_VERSION}-slim
RUN groupadd --gid 1000 app && useradd --uid 1002 --gid 1000 --no-create-home --shell /usr/sbin/nologin app
WORKDIR /workspace
COPY --from=build --chown=1002:1000 /workspace /workspace
ENV PATH="/workspace/.venv/bin:${PATH}" PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PORT=8080
USER 1002:1000
EXPOSE 8080
CMD ["python", "run.py"]
