import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrandSwatches } from '.'
import { BRANDS } from '../../features/theme/brands'

function renderizar(value: Parameters<typeof BrandSwatches>[0]['value'] = 'ambar') {
  const onChange = vi.fn()
  render(<BrandSwatches value={value} onChange={onChange} label="Cor da marca" />)
  return onChange
}

describe('BrandSwatches', () => {
  it('mostra uma opção para cada paleta do catálogo', () => {
    renderizar()

    expect(screen.getAllByRole('button')).toHaveLength(BRANDS.length)
  })

  it('marca só a paleta ativa como pressionada', () => {
    renderizar('azul-escuro')

    expect(screen.getByRole('button', { name: /Azul escuro/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /Âmbar/ })).toHaveAttribute('aria-pressed', 'false')
  })

  it('avisa a escolha em vez de guardar o estado sozinho', async () => {
    const user = userEvent.setup()
    const onChange = renderizar()

    await user.click(screen.getByRole('button', { name: /Verde claro/ }))

    expect(onChange).toHaveBeenCalledWith('verde-claro')
  })

  it('destaca a recomendada da casa', () => {
    renderizar()

    expect(screen.getByRole('button', { name: /Âmbar/ })).toHaveTextContent('Recomendada')
  })

  it('carrega a paleta no próprio botão, que é o que pinta a amostra', () => {
    // O quadradinho lê `--brand-swatch` do `data-brand` do botão. Sem o
    // atributo, todas as amostras sairiam da cor do site em vez da própria.
    renderizar()

    expect(screen.getByRole('button', { name: /Rosa escuro/ })).toHaveAttribute(
      'data-brand',
      'rosa-escuro',
    )
  })

  it('dá um nome ao grupo, para o leitor de tela anunciar do que se trata', () => {
    renderizar()

    expect(screen.getByRole('group', { name: 'Cor da marca' })).toBeInTheDocument()
  })
})
