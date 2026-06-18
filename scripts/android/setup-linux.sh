#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

REQUIRED_JAVA_MAJOR="17"
DEFAULT_ANDROID_HOME="$HOME/Android/Sdk"
CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
SDK_PACKAGES=(
  "cmdline-tools;latest"
  "platform-tools"
  "platforms;android-34"
  "build-tools;34.0.0"
)

MODE="check"
ACCEPT_LICENSES=0

print_help() {
  cat <<'EOF'
Usage: bash scripts/android/setup-linux.sh [options]

Check or install Ubuntu/WSL Android debug build prerequisites.

Options:
  --check             Check prerequisites only. This is the default and never installs,
                      downloads, accepts licenses, or edits shell profile files.
  --install           Install Ubuntu packages, Android command-line tools when missing,
                      and SDK packages required by this repo.
  --accept-licenses   Accept Android SDK licenses. Only valid with --install.
  --help              Show this help message and exit.
  --                  Ignored, for npm argument forwarding.

Required Android SDK packages:
  cmdline-tools;latest
  platform-tools
  platforms;android-34
  build-tools;34.0.0

Examples:
  bash scripts/android/setup-linux.sh --check
  bash scripts/android/setup-linux.sh --install
  bash scripts/android/setup-linux.sh --install --accept-licenses
  npm run android:setup:check -- --help

Notes:
  Ubuntu/WSL is the only supported target. Keep WSL repos under Linux paths such
  as /home/<user>/repos/one-match, not under /mnt/c/.
  If ANDROID_HOME points to an existing directory, it is used. Otherwise this
  script uses $HOME/Android/Sdk internally and prints export instructions.
EOF
}

while (($#)); do
  case "$1" in
    --check)
      MODE="check"
      ;;
    --install)
      MODE="install"
      ;;
    --accept-licenses)
      ACCEPT_LICENSES=1
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

if [[ "$ACCEPT_LICENSES" -eq 1 && "$MODE" != "install" ]]; then
  printf 'Unsupported option combination: --accept-licenses requires --install.\n' >&2
  exit 2
fi

section() {
  printf '\n==> %s\n' "$1"
}

pass() {
  printf 'PASS: %s\n' "$1"
}

fail() {
  printf 'MISSING: %s\n' "$1"
}

info() {
  printf 'INFO: %s\n' "$1"
}

unsupported() {
  printf 'UNSUPPORTED: %s\n' "$1" >&2
  exit 2
}

is_wsl() {
  [[ -n "${WSL_DISTRO_NAME:-}" ]] || grep -qiE '(microsoft|wsl)' /proc/version 2>/dev/null
}

validate_host() {
  if [[ ! -r /etc/os-release ]]; then
    unsupported "Cannot read /etc/os-release. Use Ubuntu or Ubuntu on WSL for this Android build process."
  fi

  . /etc/os-release
  if [[ "${ID:-}" != "ubuntu" ]]; then
    unsupported "Only Ubuntu/WSL is supported. Detected ID='${ID:-unknown}'. Use Ubuntu or Ubuntu on WSL."
  fi

  case "$REPO_ROOT" in
    /mnt/c|/mnt/c/*|/mnt/C|/mnt/C/*)
      unsupported "Repo is under $REPO_ROOT. Move it to a Linux filesystem path such as /home/<user>/repos/one-match."
      ;;
  esac

  if is_wsl; then
    pass "Host target: Ubuntu on WSL"
  else
    pass "Host target: Ubuntu"
  fi
  pass "Repository path: $REPO_ROOT"
}

selected_android_home() {
  if [[ -n "${ANDROID_HOME:-}" && -d "$ANDROID_HOME" ]]; then
    printf '%s\n' "$ANDROID_HOME"
  else
    printf '%s\n' "$DEFAULT_ANDROID_HOME"
  fi
}

sdkmanager_path() {
  local android_home="$1"
  if [[ -x "$android_home/cmdline-tools/latest/bin/sdkmanager" ]]; then
    printf '%s\n' "$android_home/cmdline-tools/latest/bin/sdkmanager"
  elif command -v sdkmanager >/dev/null 2>&1; then
    command -v sdkmanager
  else
    return 1
  fi
}

adb_path() {
  local android_home="$1"
  if [[ -x "$android_home/platform-tools/adb" ]]; then
    printf '%s\n' "$android_home/platform-tools/adb"
  elif command -v adb >/dev/null 2>&1; then
    command -v adb
  else
    return 1
  fi
}

detect_java_major() {
  local java_output major
  java_output="$(java -version 2>&1 || true)"
  if [[ -z "$java_output" ]]; then
    return 1
  fi

  major="$(printf '%s\n' "$java_output" | awk -F '"' '/version/ {print $2; exit}' | cut -d. -f1)"
  if [[ -n "$major" ]]; then
    printf '%s\n' "$major"
    return 0
  fi
  return 1
}

check_java() {
  local status=0 major
  if command -v java >/dev/null 2>&1; then
    major="$(detect_java_major || true)"
    if [[ "$major" == "$REQUIRED_JAVA_MAJOR" ]]; then
      pass "Java $REQUIRED_JAVA_MAJOR detected: $(command -v java)"
    else
      fail "Java $REQUIRED_JAVA_MAJOR required; detected Java major '${major:-unknown}' from $(command -v java)."
      status=1
    fi
  else
    fail "Java $REQUIRED_JAVA_MAJOR not found on PATH. Install openjdk-17-jdk."
    status=1
  fi

  if [[ -n "${JAVA_HOME:-}" ]]; then
    if [[ -x "$JAVA_HOME/bin/java" ]]; then
      pass "JAVA_HOME: $JAVA_HOME"
    else
      fail "JAVA_HOME is set but $JAVA_HOME/bin/java is not executable."
      status=1
    fi
  else
    fail "JAVA_HOME is not set. Export it after installing JDK 17."
    status=1
  fi

  return "$status"
}

package_dir() {
  local android_home="$1"
  local package_name="$2"
  case "$package_name" in
    "cmdline-tools;latest") printf '%s\n' "$android_home/cmdline-tools/latest" ;;
    "platform-tools") printf '%s\n' "$android_home/platform-tools" ;;
    "platforms;android-34") printf '%s\n' "$android_home/platforms/android-34" ;;
    "build-tools;34.0.0") printf '%s\n' "$android_home/build-tools/34.0.0" ;;
    *) return 1 ;;
  esac
}

check_android_sdk() {
  local android_home="$1"
  local status=0 path package_name

  if [[ -n "${ANDROID_HOME:-}" && -d "$ANDROID_HOME" ]]; then
    pass "ANDROID_HOME: $ANDROID_HOME"
  elif [[ -n "${ANDROID_HOME:-}" ]]; then
    fail "ANDROID_HOME is set to '$ANDROID_HOME' but that directory does not exist. Using default check path $android_home."
    status=1
  else
    fail "ANDROID_HOME is not set. Default SDK path is $android_home."
    status=1
  fi

  if [[ -d "$android_home" ]]; then
    pass "Android SDK directory exists: $android_home"
  else
    fail "Android SDK directory missing: $android_home"
    status=1
  fi

  if path="$(sdkmanager_path "$android_home")"; then
    pass "sdkmanager: $path"
  else
    fail "sdkmanager not found. Install cmdline-tools;latest under $android_home/cmdline-tools/latest."
    status=1
  fi

  if path="$(adb_path "$android_home")"; then
    pass "adb: $path"
  else
    fail "adb not found. Install platform-tools under $android_home/platform-tools."
    status=1
  fi

  for package_name in "${SDK_PACKAGES[@]}"; do
    path="$(package_dir "$android_home" "$package_name")"
    if [[ -d "$path" ]]; then
      pass "SDK package $package_name: $path"
    else
      fail "SDK package $package_name missing at $path"
      status=1
    fi
  done

  return "$status"
}

print_exports() {
  local android_home="$1"
  cat <<EOF

Add these exports to your current shell or shell profile manually if needed:
  export ANDROID_HOME="$android_home"
  export PATH="\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools:\$PATH"

This script does not edit .bashrc, .zshrc, .profile, or other shell profile files.
EOF
}

run_check() {
  local android_home="$1"
  local status=0

  section "Host"
  validate_host

  section "Java"
  check_java || status=1

  section "Android SDK"
  check_android_sdk "$android_home" || status=1

  print_exports "$android_home"

  if [[ "$status" -eq 0 ]]; then
    printf '\nAll Ubuntu/WSL Android prerequisites are present.\n'
  else
    cat <<EOF

One or more prerequisites are missing or misconfigured.
To install supported Ubuntu/WSL prerequisites, run:
  bash scripts/android/setup-linux.sh --install

To install and accept Android SDK licenses explicitly, run:
  bash scripts/android/setup-linux.sh --install --accept-licenses
EOF
  fi

  return "$status"
}

install_ubuntu_packages() {
  section "Ubuntu packages"
  sudo apt-get update
  sudo apt-get install -y openjdk-17-jdk unzip curl ca-certificates
}

install_cmdline_tools() {
  local android_home="$1"
  local sdkmanager_bin="$android_home/cmdline-tools/latest/bin/sdkmanager"
  local temp_dir zip_path extracted_dir

  if [[ -x "$sdkmanager_bin" ]]; then
    pass "Android command-line tools already installed: $sdkmanager_bin"
    return 0
  fi

  section "Android command-line tools"
  mkdir -p "$android_home/cmdline-tools"
  temp_dir="$(mktemp -d)"
  zip_path="$temp_dir/commandlinetools-linux.zip"

  cleanup() {
    rm -rf "$temp_dir"
  }
  trap cleanup RETURN

  curl -fL "$CMDLINE_TOOLS_URL" -o "$zip_path"
  unzip -q "$zip_path" -d "$temp_dir"
  extracted_dir="$temp_dir/cmdline-tools"

  if [[ ! -d "$extracted_dir" ]]; then
    printf 'Downloaded command-line tools zip did not contain cmdline-tools/.\n' >&2
    exit 1
  fi

  rm -rf "$android_home/cmdline-tools/latest"
  mkdir -p "$android_home/cmdline-tools/latest"
  shopt -s dotglob
  mv "$extracted_dir"/* "$android_home/cmdline-tools/latest/"
  shopt -u dotglob

  if [[ ! -x "$sdkmanager_bin" ]]; then
    printf 'sdkmanager was not installed at expected path: %s\n' "$sdkmanager_bin" >&2
    exit 1
  fi

  pass "Installed Android command-line tools: $sdkmanager_bin"
}

install_sdk_packages() {
  local android_home="$1"
  local sdkmanager_bin

  section "Android SDK packages"
  sdkmanager_bin="$(sdkmanager_path "$android_home")"

  if [[ "$ACCEPT_LICENSES" -eq 1 ]]; then
    section "Android SDK licenses"
    yes | "$sdkmanager_bin" --sdk_root="$android_home" --licenses
  else
    info "Skipping SDK license acceptance. Add --accept-licenses with --install to accept licenses explicitly if package installation requires it."
  fi

  "$sdkmanager_bin" --sdk_root="$android_home" "${SDK_PACKAGES[@]}" < /dev/null
}

run_install() {
  local android_home="$1"

  section "Host"
  validate_host
  info "Using Android SDK path: $android_home"

  install_ubuntu_packages
  install_cmdline_tools "$android_home"
  install_sdk_packages "$android_home"
  print_exports "$android_home"

  section "Post-install check"
  run_check "$android_home"
}

ANDROID_HOME_SELECTED="$(selected_android_home)"

case "$MODE" in
  check)
    run_check "$ANDROID_HOME_SELECTED"
    ;;
  install)
    run_install "$ANDROID_HOME_SELECTED"
    ;;
  *)
    printf 'Unknown mode: %s\n' "$MODE" >&2
    exit 2
    ;;
esac
