'use client'

import { useEffect } from 'react'
import { getAnonId, getHashedAnonId, deriveHandle } from '@/lib/identity'
import { useAppStore } from '@/store/useAppStore'

export function IdentityInit() {
  const setIdentity = useAppStore((s) => s.setIdentity)

  useEffect(() => {
    async function init() {
      const rawId = getAnonId()
      const hashedId = await getHashedAnonId()
      const handle = deriveHandle(hashedId.slice(0, 8))
      setIdentity(rawId, hashedId, handle)
    }
    init()
  }, [setIdentity])

  return null
}
