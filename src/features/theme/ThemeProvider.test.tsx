import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from './ThemeProvider'
import { ThemeToggle } from '../../components/ThemeToggle'
import { useTheme } from './useTheme'
import { THEME_STORAGE_KEY } from './themeStorage'

function Sonda() {
  const { preference, theme } = useTheme()
  return <output data-testid="tema">{`${preference}|${theme}`}</output>
}

function renderizar() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
      <Sonda />
    </ThemeProvider>,
  )
}

afterEach(() => {
  localStorage.clear()
  delete document.documentElement.dataset.theme
})

describe('ThemeProvider', () => {
  it('começa seguindo o sistema quando não há escolha salva', () => {
    renderizar()

    // O duplo de `matchMedia` do setup responde "não prefere escuro".
    expect(screen.getByTestId('tema')).toHaveTextContent('system|light')
  })

  it('respeita a preferência já salva no navegador', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    renderizar()

    expect(screen.getByTestId('tema')).toHaveTextContent('dark|dark')
  })

  it('ignora um valor inválido no storage em vez de quebrar', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'roxo')
    renderizar()

    expect(screen.getByTestId('tema')).toHaveTextContent('system|light')
  })

  it('escreve o tema resolvido no <html>, que é o que o CSS lê', async () => {
    const user = userEvent.setup()
    renderizar()

    await user.click(screen.getByRole('button', { name: 'Tema escuro' }))

    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('guarda a escolha para a próxima visita', async () => {
    const user = userEvent.setup()
    renderizar()

    await user.click(screen.getByRole('button', { name: 'Tema escuro' }))

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })

  it('volta a acompanhar o sistema quando a pessoa escolhe "automático"', async () => {
    const user = userEvent.setup()
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    renderizar()

    await user.click(screen.getByRole('button', { name: 'Acompanhar o sistema' }))

    expect(screen.getByTestId('tema')).toHaveTextContent('system|light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('marca apenas a opção ativa como pressionada', async () => {
    const user = userEvent.setup()
    renderizar()

    await user.click(screen.getByRole('button', { name: 'Tema claro' }))

    expect(screen.getByRole('button', { name: 'Tema claro' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Tema escuro' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('falha alto quando usado fora do provider, em vez de pintar o tema errado em silêncio', () => {
    const original = console.error
    console.error = () => {}

    expect(() => render(<Sonda />)).toThrow(/ThemeProvider/)

    console.error = original
  })
})
