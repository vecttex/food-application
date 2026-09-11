const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

/**
 * Validação client-side antes do upload — evita gastar banda subindo um
 * arquivo que o Storage/pgcrypto vai rejeitar (ou pior, aceitar sem dar
 * feedback nenhum sobre o motivo).
 */
export function validatePhotoFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Formato inválido. Envie uma imagem JPG, PNG ou WEBP.'
  }

  if (file.size > MAX_SIZE_BYTES) {
    return 'Arquivo muito grande. O limite é 5MB.'
  }

  return null
}
