import { useEffect } from "react";

// Reference-counted body scroll lock. Multiple modals can request a lock at
// once; the page is only unlocked once every lock is released. This avoids one
// modal's cleanup clobbering another's (e.g. edit + delete on the same task).
let lockCount = 0;
let prevOverflow = "";

function acquire() {
  if (lockCount === 0) {
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;
}

function release() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = prevOverflow;
  }
}

// Lock body scroll while `active` is true.
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    acquire();
    return release;
  }, [active]);
}
