import '@testing-library/jest-dom/vitest'

/**
 * `matchMedia` não existe no jsdom.
 *
 * O tema depende dele para resolver a preferência "sistema", e sem este duplo
 * qualquer teste que monte um componente sob o `ThemeProvider` quebraria por um
 * motivo que não tem nada a ver com o que está sendo testado. O padrão é "não
 * prefere escuro"; um teste que precise do contrário sobrescreve pontualmente.
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
})
