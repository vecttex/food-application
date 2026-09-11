import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AddressContext, type AddressContextValue } from './AddressContext'
import { EMPTY_ADDRESS, type AddressField } from './types'

type Props = { children: ReactNode }

/**
 * Guarda o endereço de entrega acima das rotas.
 *
 * Sem isso, sair do Pedido para adicionar mais um lanche e voltar apagaria tudo
 * que a pessoa já tinha digitado — e esse vai-e-volta é o caminho normal de uso.
 */
export function AddressProvider({ children }: Props) {
  const [address, setAddress] = useState(EMPTY_ADDRESS)

  const updateField = useCallback((field: AddressField, value: string) => {
    setAddress((current) => ({ ...current, [field]: value }))
  }, [])

  const clear = useCallback(() => setAddress(EMPTY_ADDRESS), [])

  const value = useMemo<AddressContextValue>(
    () => ({ address, updateField, clear }),
    [address, updateField, clear],
  )

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
}
