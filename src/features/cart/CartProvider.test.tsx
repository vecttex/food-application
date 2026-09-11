import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartProvider } from './CartProvider'
import { useCart } from './useCart'
import type { MenuItem } from '../menu/types'

const burger: MenuItem = {
  id: 'l1',
  name: 'Clássico Brasa',
  description: 'Blend de 180 g.',
  priceCents: 3400,
  ingredients: [],
  photoUrl: null,
  tag: null,
  featured: false,
  bestseller: false,
}

function Probe() {
  const { add, decrement, totalQuantity, totalCents, empty } = useCart()

  return (
    <div>
      <button type="button" onClick={() => add(burger)}>
        adicionar
      </button>
      <button type="button" onClick={() => decrement(burger.id)}>
        remover
      </button>
      <output data-testid="resumo">
        {totalQuantity}|{totalCents}|{String(empty)}
      </output>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <CartProvider>
      <Probe />
    </CartProvider>,
  )
}

describe('CartProvider', () => {
  it('começa vazio', () => {
    renderWithProvider()

    expect(screen.getByTestId('resumo')).toHaveTextContent('0|0|true')
  })

  it('reflete adições no total e na quantidade', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    await user.click(screen.getByRole('button', { name: 'adicionar' }))
    await user.click(screen.getByRole('button', { name: 'adicionar' }))

    expect(screen.getByTestId('resumo')).toHaveTextContent('2|6800|false')
  })

  it('volta a ficar vazio quando a última unidade sai', async () => {
    const user = userEvent.setup()
    renderWithProvider()

    await user.click(screen.getByRole('button', { name: 'adicionar' }))
    await user.click(screen.getByRole('button', { name: 'remover' }))

    expect(screen.getByTestId('resumo')).toHaveTextContent('0|0|true')
  })

  it('falha alto quando usado fora do provider, em vez de devolver carrinho fantasma', () => {
    // O React loga o erro do render; silenciar mantém a saída do teste legível.
    const original = console.error
    console.error = () => {}

    expect(() => render(<Probe />)).toThrow(/CartProvider/)

    console.error = original
  })
})
