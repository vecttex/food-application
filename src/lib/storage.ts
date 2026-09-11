import { supabase } from './supabase'

/** Bucket público onde ficam as fotos do cardápio. */
export const BUCKET_MENU = 'menu'

/**
 * Converte o path relativo guardado em `menu_items.photo_url`
 * (ex.: `lanches/classico-brasa.jpg`) na URL pública do arquivo.
 *
 * O banco guarda o path, não a URL absoluta: assim, trocar de bucket, de
 * projeto Supabase ou colocar um CDN na frente não exige reescrever registro
 * nenhum — só este módulo muda.
 */
export function getPublicPhotoUrl(path: string | null): string | null {
  if (!path) return null

  // Tolera registros legados que já guardaram a URL inteira.
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  return supabase.storage.from(BUCKET_MENU).getPublicUrl(path).data.publicUrl
}
