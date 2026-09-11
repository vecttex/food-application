import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenuItemCard } from '.'
import type { MenuItem } from '../../types'

const item: MenuItem = {
  id: 'l1',
  name: 'Clássico Brasa',
  description: 'Blend de 180 g, cheddar maturado e cebola caramelizada.',
  priceCents: 3400,
  ingredients: ['Pão brioche', 'Blend de 180 g', 'Cheddar maturado'],
  photoUrl: null,
  tag: 'veggie',
  featured: false,
  bestseller: false,
}

function renderCard(overrides: Partial<Parameters<typeof MenuItemCard>[0]> = {}) {
  const props = {
    item,
    expanded: false,
    onToggle: vi.fn(),
    onAdd: vi.fn(),
    cartQuantity: 0,
    ...overrides,
  }

  render(<MenuItemCard {...props} />)
  return props
}

describe('MenuItemCard', () => {
  it('mostra nome, descrição, preço formatado e a tag', () => {
    renderCard()

    expect(screen.getByText('Clássico Brasa')).toBeInTheDocument()
    expect(screen.getByText(/Blend de 180 g, cheddar/)).toBeInTheDocument()
    expect(screen.getByText('R$ 34,00')).toBeInTheDocument()
    expect(screen.getByText('veggie')).toBeInTheDocument()
  })

  it('dá ao botão de adicionar um rótulo que identifica o item', async () => {
    const user = userEvent.setup()
    const props = renderCard()

    await user.click(screen.getByRole('button', { name: 'Adicionar Clássico Brasa ao pedido' }))

    expect(props.onAdd).toHaveBeenCalledTimes(1)
  })

  it('esconde os ingredientes enquanto está fechado', () => {
    renderCard()

    expect(screen.queryByText('Ingredientes')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument()
  })

  it('mostra os ingredientes quando expandido', () => {
    renderCard({ expanded: true })

    expect(screen.getByText('Ingredientes')).toBeInTheDocument()
    expect(screen.getByText('Pão brioche')).toBeInTheDocument()
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument()
  })

  it('avisa a página ao clicar no gatilho, em vez de guardar o estado sozinho', async () => {
    const user = userEvent.setup()
    const props = renderCard()

    await user.click(screen.getByRole('button', { expanded: false }))

    expect(props.onToggle).toHaveBeenCalledTimes(1)
  })

  it('não oferece expansão para item sem ingredientes cadastrados', () => {
    renderCard({ item: { ...item, ingredients: [] } })

    expect(screen.queryByRole('button', { expanded: false })).not.toBeInTheDocument()
  })

  it('indica quantas unidades já estão no pedido, com rótulo legível por leitor de tela', () => {
    renderCard({ cartQuantity: 2 })

    expect(screen.getByLabelText('2 no pedido')).toHaveTextContent('2')
  })

  it('não mostra o indicador quando o item ainda não está no pedido', () => {
    renderCard()

    expect(screen.queryByLabelText(/no pedido/)).not.toBeInTheDocument()
  })
})
