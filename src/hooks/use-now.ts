"use client"

import { useSyncExternalStore } from "react"

// A shared, ticking "now" so components never call Date.now() during render.
// The server snapshot is 0, so anything time-based renders only after hydration.
let now = 0
let timer: ReturnType<typeof setInterval> | undefined
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (!timer) {
    timer = setInterval(() => {
      now = Date.now()
      listeners.forEach((l) => l())
    }, 15_000)
  }
  return () => {
    listeners.delete(listener)
    if (!listeners.size && timer) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

function getSnapshot() {
  if (!now) now = Date.now()
  return now
}

function getServerSnapshot() {
  return 0
}

export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

const noopSubscribe = () => () => {}

/** true only on the client after hydration */
export function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}
