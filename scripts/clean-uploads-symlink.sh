#!/bin/sh
# Guards against a corrupted uploads symlink chain (ELOOP) left over from an
# earlier deploy. The loop can be indirect: e.g. public/uploads/uploads is a
# symlink to the Railway volume root, and the volume root separately
# contains an "uploads" symlink pointing back to public/uploads. Neither
# symlink points directly at itself, so a plain realpath check on each link
# doesn't catch it — but walking through it repeatedly does eventually hit
# ELOOP, same as Next.js's recursive directory scan does at startup.
#
# Strategy: for every symlink directly inside public/uploads, probe it by
# stat-ing a deep synthetic path built by repeating its name. If that probe
# fails with ELOOP ("too many levels of symbolic links"), this symlink is
# part of a cycle — remove it. Real uploaded files are never symlinks, so
# they're untouched. Safe to run on every boot.

UPLOADS_PATH="public/uploads"

mkdir -p "$UPLOADS_PATH"

# If public/uploads itself is a symlink, drop it and start clean.
if [ -L "$UPLOADS_PATH" ]; then
  echo "Found symlink at $UPLOADS_PATH, removing to prevent ELOOP..."
  rm -f "$UPLOADS_PATH"
  mkdir -p "$UPLOADS_PATH"
fi

found=0
for link in "$UPLOADS_PATH"/*; do
  [ -L "$link" ] || continue

  name=$(basename "$link")
  probe="$link"
  i=0
  while [ "$i" -lt 60 ]; do
    probe="$probe/$name"
    i=$((i + 1))
  done

  err=$(stat "$probe" 2>&1 >/dev/null)
  case "$err" in
    *"too many levels"*|*"Too many levels"*|*ELOOP*)
      echo "Found looping symlink at $link, removing to prevent ELOOP..."
      rm -f "$link"
      found=1
      ;;
  esac
done

if [ "$found" = "0" ]; then
  echo "No looping uploads symlink found."
fi

echo "public/uploads ready."
