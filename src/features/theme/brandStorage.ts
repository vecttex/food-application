import { DEFAULT_BRAND, isBrandId, type BrandId } from './brands'

/**
 * Aplicação e cache da cor da marca.
 *
 * Diferente do tema, a cor não é escolha do visitante: ela vem de
 * `site_config`, definida pelo admin. Só que essa leitura é uma ida ao
 * Supabase — e sem nenhum cuidado a página abriria âmbar e trocaria de cor
 * quando a resposta chegasse, na frente do usuário.
 *
 * Por isso a última cor conhecida fica no `localStorage`: o script inline do
 * `index.html` a aplica antes do primeiro pintar, e o provider corrige depois,
 * se o admin tiver trocado. Cache de conveniência, nunca fonte da verdade —
 * quem manda é sempre o banco.
 */

/** Mesma chave usada no script anti-flash do `index.html`. */
export const BRAND_STORAGE_KEY = 'brasa-nove-marca'

/** Leitura tolerante: modo anônimo e storage bloqueado não podem quebrar o app. */
export function readCachedBrand(): BrandId {
  try {
    const stored = localStorage.getItem(BRAND_STORAGE_KEY)
    return isBrandId(stored) ? stored : DEFAULT_BRAND
  } catch {
    return DEFAULT_BRAND
  }
}

export function cacheBrand(brand: BrandId): void {
  try {
    localStorage.setItem(BRAND_STORAGE_KEY, brand)
  } catch {
    // Sem storage, a próxima visita volta a abrir no padrão e se corrige
    // quando a configuração chega. Não é motivo para derrubar a tela.
  }
}

/**
 * Escreve a paleta no `<html>`, sem tocar no cache. É `data-brand` que faz
 * `themes/brands.css` valer, e a partir daí todo `--color-brand*` da aplicação
 * muda junto.
 *
 * Existe separado de `applyBrandToDocument` por causa da pré-visualização do
 * admin: enquanto a pessoa clica nos quadradinhos, a tela inteira já mostra a
 * cor nova — mas nada disso pode virar o "último valor conhecido" antes de a
 * escolha ser salva, senão sair da tela sem salvar deixaria a próxima visita
 * abrindo na cor errada.
 */
export function setDocumentBrand(brand: BrandId): void {
  document.documentElement.dataset.brand = brand
}

/** Pinta e lembra: usado quando a cor vem confirmada do banco. */
export function applyBrandToDocument(brand: BrandId): void {
  setDocumentBrand(brand)
  cacheBrand(brand)
}
