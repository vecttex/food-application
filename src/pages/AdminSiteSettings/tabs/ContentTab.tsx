import { useState, type ChangeEvent } from 'react'
import { Button } from '../../../components/Button'
import { IconButton } from '../../../components/IconButton'
import { IconPlus, IconTrash } from '../../../components/Icon'
import { Input } from '../../../components/Input'
import { ItemPhoto } from '../../../components/ItemPhoto'
import { Panel } from '../../../components/Panel'
import { Select } from '../../../components/Select'
import { StatusMessage } from '../../../components/StatusMessage'
import { Switch } from '../../../components/Switch'
import { Textarea } from '../../../components/Textarea'
import {
  addGalleryPhoto,
  deleteFaqItem,
  deleteGalleryPhoto,
  deleteTestimonial,
  saveFaqItem,
  saveTestimonial,
  updateGalleryPhoto,
} from '../../../features/admin/siteConfigService'
import { validatePhotoFile } from '../../../features/admin/validatePhotoFile'
import type { FaqItem, GalleryPhoto, Testimonial } from '../../../features/site/types'
import styles from '../Settings.module.css'

type Props = {
  faq: FaqItem[]
  testimonials: Testimonial[]
  gallery: GalleryPhoto[]
  /** Recarrega tudo depois de uma escrita — o banco é a fonte da verdade. */
  onReload: () => void
}

const RATINGS = [5, 4, 3, 2, 1].map((rating) => ({
  value: String(rating),
  label: `${rating} estrela${rating > 1 ? 's' : ''}`,
}))

function newQuestion(sortOrder: number): FaqItem {
  return { id: '', question: '', answer: '', sortOrder, published: true }
}

function newTestimonial(sortOrder: number): Testimonial {
  return { id: '', author: '', rating: 5, comment: '', sortOrder, published: true }
}

/**
 * Conteúdo editorial da vitrine: FAQ, avaliações e galeria.
 *
 * Cada item salva sozinho, e não junto da barra do rodapé: são listas, e uma
 * pessoa mexe em uma linha por vez. Um "salvar tudo" aqui significaria
 * reescrever registros que ninguém tocou — e sobrescrever a alteração de outro
 * administrador que estivesse na mesma tela.
 *
 * Os rascunhos nascem das props e não são sincronizados por efeito: depois de
 * cada escrita o pai recarrega os dados e remonta esta aba por `key`, o que
 * reinicia o estado sem a cascata de renderização que um `useEffect` de
 * sincronia provocaria.
 */
export function ContentTab({ faq, testimonials, gallery, onReload }: Props) {
  const [questions, setQuestions] = useState<FaqItem[]>(faq)
  const [testimonialDrafts, setTestimonialDrafts] = useState<Testimonial[]>(testimonials)
  const [photos, setPhotos] = useState<GalleryPhoto[]>(gallery)
  const [error, setError] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  async function run(action: () => Promise<void>) {
    setError(null)
    try {
      await action()
      onReload()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível salvar.')
    }
  }

  async function uploadGalleryPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validatePhotoFile(file)
    if (validationError) {
      setError(validationError)
      event.target.value = ''
      return
    }

    setUploadingPhoto(true)
    await run(() => addGalleryPhoto(file, '', photos.length * 10))
    setUploadingPhoto(false)
    event.target.value = ''
  }

  return (
    <>
      {error ? <StatusMessage type="error" title={error} /> : null}

      <Panel stacked>
        <h2 className={styles.sectionTitle}>Perguntas frequentes</h2>
        <p className={styles.sectionText}>
          Aparecem em acordeão na página inicial, na ordem definida abaixo.
        </p>

        <div className={styles.items}>
          {questions.length === 0 ? (
            <p className={styles.itemEmpty}>Nenhuma pergunta cadastrada.</p>
          ) : null}

          {questions.map((question, index) => (
            <div key={question.id || `new-${index}`} className={styles.item}>
              <Input
                label="Pergunta"
                value={question.question}
                onChange={(event) =>
                  setQuestions((current) =>
                    current.map((q, i) => (i === index ? { ...q, question: event.target.value } : q)),
                  )
                }
              />

              <Textarea
                label="Resposta"
                rows={2}
                value={question.answer}
                onChange={(event) =>
                  setQuestions((current) =>
                    current.map((q, i) => (i === index ? { ...q, answer: event.target.value } : q)),
                  )
                }
              />

              <div className={styles.itemTop}>
                <Switch
                  label="Publicada"
                  checked={question.published}
                  onChange={(checked) =>
                    setQuestions((current) =>
                      current.map((q, i) => (i === index ? { ...q, published: checked } : q)),
                    )
                  }
                />

                <div className={styles.itemActions}>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => run(() => saveFaqItem(question))}
                  >
                    Salvar
                  </Button>
                  {question.id ? (
                    <IconButton
                      label={`Excluir pergunta ${question.question}`}
                      variant="ghost"
                      onClick={() => run(() => deleteFaqItem(question.id))}
                    >
                      <IconTrash width={16} height={16} />
                    </IconButton>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setQuestions((current) => [...current, newQuestion(current.length * 10)])}
        >
          <IconPlus width={16} height={16} />
          Adicionar pergunta
        </Button>
      </Panel>

      <Panel stacked>
        <h2 className={styles.sectionTitle}>Avaliações</h2>
        <p className={styles.sectionText}>
          Cadastre aqui comentários reais de clientes, com o nome de quem escreveu. A seção só
          aparece no site quando existe pelo menos uma publicada.
        </p>

        <div className={styles.items}>
          {testimonialDrafts.length === 0 ? (
            <p className={styles.itemEmpty}>Nenhuma avaliação cadastrada.</p>
          ) : null}

          {testimonialDrafts.map((testimonial, index) => (
            <div key={testimonial.id || `new-${index}`} className={styles.item}>
              <div className={styles.twoColumn}>
                <Input
                  label="Nome de quem avaliou"
                  value={testimonial.author}
                  onChange={(event) =>
                    setTestimonialDrafts((current) =>
                      current.map((t, i) => (i === index ? { ...t, author: event.target.value } : t)),
                    )
                  }
                />
                <Select
                  label="Nota"
                  value={String(testimonial.rating)}
                  options={RATINGS}
                  onChange={(event) =>
                    setTestimonialDrafts((current) =>
                      current.map((t, i) =>
                        i === index ? { ...t, rating: Number(event.target.value) } : t,
                      ),
                    )
                  }
                />
              </div>

              <Textarea
                label="Comentário"
                rows={2}
                value={testimonial.comment}
                onChange={(event) =>
                  setTestimonialDrafts((current) =>
                    current.map((t, i) => (i === index ? { ...t, comment: event.target.value } : t)),
                  )
                }
              />

              <div className={styles.itemTop}>
                <Switch
                  label="Publicada"
                  checked={testimonial.published}
                  onChange={(checked) =>
                    setTestimonialDrafts((current) =>
                      current.map((t, i) => (i === index ? { ...t, published: checked } : t)),
                    )
                  }
                />

                <div className={styles.itemActions}>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => run(() => saveTestimonial(testimonial))}
                  >
                    Salvar
                  </Button>
                  {testimonial.id ? (
                    <IconButton
                      label={`Excluir avaliação de ${testimonial.author}`}
                      variant="ghost"
                      onClick={() => run(() => deleteTestimonial(testimonial.id))}
                    >
                      <IconTrash width={16} height={16} />
                    </IconButton>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setTestimonialDrafts((current) => [...current, newTestimonial(current.length * 10)])}
        >
          <IconPlus width={16} height={16} />
          Adicionar avaliação
        </Button>
      </Panel>

      <Panel stacked>
        <h2 className={styles.sectionTitle}>Galeria</h2>
        <p className={styles.sectionText}>
          Fotos do ambiente e dos pratos. A primeira da lista ocupa o bloco grande do mosaico.
        </p>

        {photos.length === 0 ? <p className={styles.itemEmpty}>Nenhuma foto na galeria.</p> : null}

        <div className={styles.gallery}>
          {photos.map((photo, index) => (
            <div key={photo.id} className={styles.galleryItem}>
              <ItemPhoto url={photo.photoUrl} alt={photo.caption} format="card" />

              <Input
                label="Legenda"
                hiddenLabel
                placeholder="Legenda"
                value={photo.caption}
                onChange={(event) =>
                  setPhotos((current) =>
                    current.map((p, i) => (i === index ? { ...p, caption: event.target.value } : p)),
                  )
                }
              />

              <Switch
                label="Publicada"
                checked={photo.published}
                onChange={(checked) =>
                  setPhotos((current) =>
                    current.map((p, i) => (i === index ? { ...p, published: checked } : p)),
                  )
                }
              />

              <div className={styles.itemActions}>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => run(() => updateGalleryPhoto(photo))}
                >
                  Salvar
                </Button>
                <IconButton
                  label="Excluir foto"
                  variant="ghost"
                  onClick={() => run(() => deleteGalleryPhoto(photo))}
                >
                  <IconTrash width={16} height={16} />
                </IconButton>
              </div>
            </div>
          ))}
        </div>

        <label className={styles.photoInput}>
          {uploadingPhoto ? 'Enviando…' : 'Adicionar foto'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={uploadGalleryPhoto}
            disabled={uploadingPhoto}
            hidden
          />
        </label>
      </Panel>
    </>
  )
}
