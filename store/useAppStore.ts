'use client'

import { create } from 'zustand'

interface AppStore {
  anonId: string
  hashedId: string
  handle: string
  setIdentity: (anonId: string, hashedId: string, handle: string) => void
  composeOpen: boolean
  setComposeOpen: (open: boolean) => void
  replyTarget: string | null
  setReplyTarget: (id: string | null) => void
}

export const useAppStore = create<AppStore>((set) => ({
  anonId: '',
  hashedId: '',
  handle: '',
  setIdentity: (anonId, hashedId, handle) => set({ anonId, hashedId, handle }),
  composeOpen: false,
  setComposeOpen: (open) => set({ composeOpen: open }),
  replyTarget: null,
  setReplyTarget: (id) => set({ replyTarget: id }),
}))
