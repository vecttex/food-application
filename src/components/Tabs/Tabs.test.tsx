import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs } from '.'

const options = [
  { value: 'lanche', label: 'Lanches' },
  { value: 'combo', label: 'Combos' },
  { value: 'bebida', label: 'Bebidas' },
]

function renderTabs(value = 'lanche') {
  const onSelect = vi.fn()
  render(
    <Tabs
      options={options}
      value={value}
      onSelect={onSelect}
      label="Categorias do cardápio"
      idPrefix="cardapio"
    />,
  )
  return onSelect
}

describe('Tabs', () => {
  it('marca apenas a aba ativa como selecionada', () => {
    renderTabs('combo')

    expect(screen.getByRole('tab', { name: 'Combos', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Lanches' })).toHaveAttribute('aria-selected', 'false')
  })

  it('liga cada aba ao painel correspondente', () => {
    renderTabs()

    expect(screen.getByRole('tab', { name: 'Bebidas' })).toHaveAttribute(
      'aria-controls',
      'cardapio-painel-bebida',
    )
  })

  it('deixa só a aba ativa na ordem de tabulação', () => {
    renderTabs('combo')

    expect(screen.getByRole('tab', { name: 'Combos' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'Lanches' })).toHaveAttribute('tabindex', '-1')
  })

  it('avisa a seleção ao clicar', async () => {
    const user = userEvent.setup()
    const onSelect = renderTabs()

    await user.click(screen.getByRole('tab', { name: 'Bebidas' }))

    expect(onSelect).toHaveBeenCalledWith('bebida')
  })

  it('navega com as setas do teclado', async () => {
    const user = userEvent.setup()
    const onSelect = renderTabs('combo')

    screen.getByRole('tab', { name: 'Combos' }).focus()
    await user.keyboard('{ArrowRight}')

    expect(onSelect).toHaveBeenCalledWith('bebida')
  })

  it('circula do último para o primeiro', async () => {
    const user = userEvent.setup()
    const onSelect = renderTabs('bebida')

    screen.getByRole('tab', { name: 'Bebidas' }).focus()
    await user.keyboard('{ArrowRight}')

    expect(onSelect).toHaveBeenCalledWith('lanche')
  })
})
