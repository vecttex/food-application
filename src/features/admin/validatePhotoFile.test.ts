import { describe, expect, it } from 'vitest'
import { validatePhotoFile } from './validatePhotoFile'

function file(type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], 'foto', { type })
}

describe('validatePhotoFile', () => {
  it('aceita jpg, png e webp dentro do limite', () => {
    expect(validatePhotoFile(file('image/jpeg', 1024))).toBeNull()
    expect(validatePhotoFile(file('image/png', 1024))).toBeNull()
    expect(validatePhotoFile(file('image/webp', 1024))).toBeNull()
  })

  it('rejeita tipo fora da lista', () => {
    expect(validatePhotoFile(file('image/gif', 1024))).toMatch(/formato inválido/i)
    expect(validatePhotoFile(file('application/pdf', 1024))).toMatch(/formato inválido/i)
  })

  it('rejeita arquivo maior que 5MB', () => {
    const fiveMb = 5 * 1024 * 1024
    expect(validatePhotoFile(file('image/jpeg', fiveMb + 1))).toMatch(/muito grande/i)
  })

  it('aceita arquivo exatamente no limite de 5MB', () => {
    const fiveMb = 5 * 1024 * 1024
    expect(validatePhotoFile(file('image/jpeg', fiveMb))).toBeNull()
  })
})
