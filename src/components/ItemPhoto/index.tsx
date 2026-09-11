import { useState, type CSSProperties } from 'react'
import { IconPhoto } from '../Icon'
import styles from './ItemPhoto.module.css'

export type PhotoFormat = 'default' | 'large' | 'rounded' | 'card' | 'panoramic' | 'circular'

type Props = {
  url: string | null
  /** Texto alternativo. Vazio ('') quando a foto é puramente decorativa. */
  alt: string
  width?: string
  height?: string
  format?: PhotoFormat
  /** Proporção fixa (ex.: '4 / 3'). Vence `height` quando os dois vêm juntos. */
  ratio?: string
  /** `eager` só para a foto acima da dobra (a capa da Home). */
  priority?: boolean
  /** Aproxima a foto no hover — só para cartões clicáveis. */
  zoomOnHover?: boolean
  className?: string
}

/**
 * Foto de item ou de capa, com estado vazio embutido.
 *
 * Concentrar o fallback aqui é o que permite cadastrar as fotos no Supabase aos
 * poucos: enquanto `url` for nulo — ou apontar para um arquivo que não existe
 * mais no bucket — o item aparece com o bloco neutro, e nenhuma tela precisa
 * saber disso.
 */
export function ItemPhoto({
  url,
  alt,
  width = '100%',
  height = '100%',
  format = 'default',
  ratio,
  priority,
  zoomOnHover,
  className,
}: Props) {
  // Uma URL nova merece uma nova tentativa: sem isso, um item que falhou
  // carregaria o estado de erro para o próximo item reciclado na mesma posição.
  // Ajuste durante a renderização (e não em `useEffect`): o React descarta a
  // saída e re-renderiza na hora, sem pintar o quadro intermediário errado.
  const [photo, setPhoto] = useState({ url, failed: false })
  if (photo.url !== url) {
    setPhoto({ url, failed: false })
  }

  const dimensions: CSSProperties = ratio
    ? { width, aspectRatio: ratio }
    : { width, height }

  const classes = [
    styles.base,
    format !== 'default' ? styles[format] : null,
    zoomOnHover ? styles.zoomOnHover : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} style={dimensions}>
      {url && !photo.failed ? (
        <img
          src={url}
          alt={alt}
          className={styles.image}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setPhoto({ url, failed: true })}
        />
      ) : (
        <div className={styles.empty} role="img" aria-label={alt || undefined}>
          <IconPhoto width={22} height={22} />
        </div>
      )}
    </div>
  )
}
