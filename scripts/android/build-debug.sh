#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ANDROID_DIR="$REPO_ROOT/android"
GRADLEW="$ANDROID_DIR/gradlew"
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"

SKIP_NPM_CI=0
SKIP_TESTS=0

print_help() {
  cat <<'EOF'
Usage: bash scripts/android/build-debug.sh [options]

Build the local Linux/WSL Android debug APK for the Capacitor app.

Options:
  --skip-npm-ci   Skip npm ci and use the existing node_modules install.
  --skip-tests    Omit Gradle testDebugUnitTest; assembleDebug still runs.
  --help          Show this help message and exit.
  --              Ignored, for npm argument forwarding.

Default build sequence:
  1. bash scripts/android/setup-linux.sh --check
  2. npm ci
  3. npm run build
  4. npx cap sync android
  5. cd android && ./gradlew testDebugUnitTest assembleDebug --no-daemon --build-cache

Examples:
  bash scripts/android/build-debug.sh
  bash scripts/android/build-debug.sh --skip-npm-ci
  bash scripts/android/build-debug.sh --skip-tests
  npm run android:build:debug -- --help
EOF
}

while (($#)); do
  case "$1" in
    --skip-npm-ci)
      SKIP_NPM_CI=1
      ;;
    --skip-tests)
      SKIP_TESTS=1
      ;;
    --help|-h)
      print_help
      exit 0
      ;;
    --)
      ;;
    *)
      printf 'Unknown option: %s\n\n' "$1" >&2
      print_help >&2
      exit 2
      ;;
  esac
  shift
done

run_step() {
  printf '\n==> %s\n' "$*"
  "$@"
}

printf 'Checking Linux Android build prerequisites...\n'
run_step bash "$REPO_ROOT/scripts/android/setup-linux.sh" --check

if [[ ! -x "$GRADLEW" ]]; then
  printf '\n==> chmod +x android/gradlew\n'
  chmod +x "$GRADLEW"
  printf 'Fixed repository permission for android/gradlew.\n'
fi

cd "$REPO_ROOT"

if [[ "$SKIP_NPM_CI" -eq 0 ]]; then
  run_step npm ci
else
  printf '\n==> Skipping npm ci (--skip-npm-ci)\n'
fi

run_step npm run build
run_step npx cap sync android

cd "$ANDROID_DIR"

if [[ "$SKIP_TESTS" -eq 0 ]]; then
  run_step ./gradlew testDebugUnitTest assembleDebug --no-daemon --build-cache
else
  run_step ./gradlew assembleDebug --no-daemon --build-cache
fi

if [[ ! -f "$APK_PATH" ]]; then
  printf '\nExpected debug APK was not found: %s\n' "$APK_PATH" >&2
  exit 1
fi

printf '\nDebug APK built successfully:\n%s\n' "$APK_PATH"
