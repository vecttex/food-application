import { useContext } from 'react'
import { AddressContext, type AddressContextValue } from './AddressContext'

export function useAddress(): AddressContextValue {
  const context = useContext(AddressContext)

  if (!context) {
    throw new Error('useAddress precisa estar dentro de <AddressProvider>.')
  }

  return context
}
