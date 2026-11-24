{{/* Names. Always <release>-<chart>, never shortened when the release name contains the chart's:
a pair's web app finds its API by this name (links), so both must compute it the same way. The
definitions are identical in every chart made from this template, so a pair's two subcharts share
them safely. */}}
{{- define "canvasapp.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "canvasapp.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name (include "canvasapp.name" .) | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{- define "canvasapp.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{ include "canvasapp.selectorLabels" . }}
app.kubernetes.io/version: {{ .Values.image.tag | default .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "canvasapp.selectorLabels" -}}
app.kubernetes.io/name: {{ include "canvasapp.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/* The image: global.imageRegistry/repository, then @digest or :tag. */}}
{{- define "canvasapp.image" -}}
{{- $repo := required "image.repository is required" .Values.image.repository }}
{{- with (.Values.global).imageRegistry }}{{ $repo = printf "%s/%s" (trimSuffix "/" .) $repo }}{{ end }}
{{- if .Values.image.digest }}
{{- printf "%s@%s" $repo .Values.image.digest }}
{{- else }}
{{- printf "%s:%s" $repo (.Values.image.tag | default .Chart.AppVersion) }}
{{- end }}
{{- end }}

{{- define "canvasapp.imagePullSecrets" -}}
{{- $all := concat ((.Values.global).imagePullSecrets | default list) (.Values.imagePullSecrets | default list) }}
{{- with $all }}
imagePullSecrets:
  {{- range . }}
  - name: {{ if kindIs "map" . }}{{ .name }}{{ else }}{{ . }}{{ end }}
  {{- end }}
{{- end }}
{{- end }}

{{/* The Secret holding every secret value: a pair's shared one, else this app's. */}}
{{- define "canvasapp.secretName" -}}
{{- (.Values.global).secretName | default .Values.secrets.name }}
{{- end }}

{{/* Every key the Secret must hold, as JSON: what the app reads, and what its database and cache
need. */}}
{{- define "canvasapp.secretKeys" -}}
{{- $k := concat .Values.secrets.keys .Values.secrets.files }}
{{- if .Values.postgresql.enabled }}{{ $k = concat $k (list "password" "postgres-password") }}{{ end }}
{{- if .Values.redis.enabled }}{{ $k = append $k "redis-password" }}{{ end }}
{{- if .Values.externalDatabase.enabled }}{{ $k = append $k "DATABASE_URL" }}{{ end }}
{{- if .Values.externalRedis.enabled }}{{ $k = append $k "REDIS_URL" }}{{ end }}
{{- if .Values.llm.enabled }}{{ $k = append $k "OPENAI_API_KEY" }}{{ end }}
{{- toJson (uniq $k) }}
{{- end }}

{{/* The Secret you applied before the install must hold every key the app needs: checked against
the cluster at install and upgrade, naming each one missing. (`helm template` cannot see the cluster,
so it checks nothing.) */}}
{{- define "canvasapp.checkSecret" -}}
{{- $name := include "canvasapp.secretName" . }}
{{- $found := lookup "v1" "Secret" .Release.Namespace $name }}
{{- if $found }}
{{- $missing := list }}
{{- range (include "canvasapp.secretKeys" . | fromJsonArray) }}
{{- if not (hasKey ($found.data | default dict) .) }}{{ $missing = append $missing . }}{{ end }}
{{- end }}
{{- with $missing }}
{{- fail (printf "the Secret %s has no %s. Add them to secret.yaml (secret.example.yaml lists every key) and kubectl apply it again" $name (join ", " .)) }}
{{- end }}
{{- end }}
{{- end }}

{{/* Sign-in: Authentik at this app's ingress, or (a pair's API) the identity its caller forwards. */}}
{{- define "canvasapp.sso" -}}
{{- if or .Values.authentik.enabled .Values.identity.fromCaller }}true{{ end }}
{{- end }}

{{/* Bitnami's own naming, so the address matches what its chart creates. */}}
{{- define "canvasapp.postgresql.host" -}}
{{- .Values.postgresql.fullnameOverride | default (printf "%s-postgresql" .Release.Name) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "canvasapp.redis.host" -}}
{{- printf "%s-master" (.Values.redis.fullnameOverride | default (printf "%s-redis" .Release.Name) | trunc 63 | trimSuffix "-") }}
{{- end }}

{{/* DATABASE_URL, and what it is made from. The same in the app and in the migrations Job. */}}
{{- define "canvasapp.databaseEnv" -}}
{{- if .Values.postgresql.enabled }}
- name: DB_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ include "canvasapp.secretName" . }}
      key: password
- name: DATABASE_URL
  value: {{ printf "postgresql://%s:$(DB_PASSWORD)@%s:5432/%s" .Values.postgresql.auth.username (include "canvasapp.postgresql.host" .) .Values.postgresql.auth.database | quote }}
{{- else if .Values.externalDatabase.enabled }}
- name: DATABASE_URL
  valueFrom:
    secretKeyRef:
      name: {{ include "canvasapp.secretName" . }}
      key: DATABASE_URL
{{- end }}
{{- end }}

{{- define "canvasapp.hasDatabase" -}}
{{- if or .Values.postgresql.enabled .Values.externalDatabase.enabled }}true{{ end }}
{{- end }}

{{/* Settings that cannot work together: refused at render, not found at 3 a.m. */}}
{{- define "canvasapp.validate" -}}
{{- if not (has .Values.stack (list "python" "next")) }}
{{- fail (printf "stack must be python or next, not %q" .Values.stack) }}
{{- end }}
{{- if and .Values.authentik.enabled (not .Values.ingress.enabled) }}
{{- fail "authentik.enabled needs ingress.enabled: sign-in happens at the Traefik ingress" }}
{{- end }}
{{- if and .Values.authentik.enabled (ne .Values.ingress.className "traefik") }}
{{- fail "authentik.enabled needs ingress.className traefik: the sign-in is a Traefik middleware" }}
{{- end }}
{{- if and .Values.ingress.enabled (not .Values.ingress.host) }}
{{- fail "ingress.host is required when ingress.enabled" }}
{{- end }}
{{- if and .Values.identity.fromCaller (not .Values.networkPolicy.enabled) }}
{{- fail "identity.fromCaller trusts X-authentik-* headers: it needs networkPolicy.enabled with allowFrom set to the web app, or anyone in the cluster can claim to be anyone" }}
{{- end }}
{{- if and .Values.persistence.enabled (gt (int .Values.replicaCount) 1) }}
{{- fail "persistence (a volume) allows one replica only: its disk attaches to one node" }}
{{- end }}
{{- if and .Values.llm.enabled (not (hasSuffix "/v1" (.Values.llm.baseUrl | trimSuffix "/"))) }}
{{- fail "llm.baseUrl is required: the company LiteLLM's address, ending in /v1" }}
{{- end }}
{{- if and .Values.egress.proxy (not .Values.egress.url) }}
{{- fail "egress.url is required: the company egress proxy's address, e.g. http://proxy.example.com:3128" }}
{{- end }}
{{- if not (has .Values.docs (list "" "private" "public")) }}
{{- fail (printf "docs must be public or private, not %q" .Values.docs) }}
{{- end }}
{{- if and .Values.redis.enabled .Values.externalRedis.enabled }}
{{- fail "redis.enabled and externalRedis.enabled are two caches: pick one" }}
{{- end }}
{{- if and .Values.postgresql.enabled .Values.externalDatabase.enabled }}
{{- fail "postgresql.enabled and externalDatabase.enabled are two databases: pick one" }}
{{- end }}
{{- $secret := include "canvasapp.secretName" . }}
{{- if and .Values.postgresql.enabled (ne .Values.postgresql.auth.existingSecret $secret) }}
{{- fail (printf "postgresql.auth.existingSecret must be %q, the Secret that holds its passwords" $secret) }}
{{- end }}
{{- if and .Values.redis.enabled (ne .Values.redis.auth.existingSecret $secret) }}
{{- fail (printf "redis.auth.existingSecret must be %q, the Secret that holds its password" $secret) }}
{{- end }}
{{- include "canvasapp.checkSecret" . }}
{{- end }}
