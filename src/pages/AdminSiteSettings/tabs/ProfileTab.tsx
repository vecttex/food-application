import { useState, type ChangeEvent } from 'react'
import { Input } from '../../../components/Input'
import { ItemPhoto } from '../../../components/ItemPhoto'
import { Panel } from '../../../components/Panel'
import { Textarea } from '../../../components/Textarea'
import { updateCoverPhoto, updateLogo } from '../../../features/admin/siteConfigService'
import { validatePhotoFile } from '../../../features/admin/validatePhotoFile'
import type { TabProps } from './types'
import styles from '../Settings.module.css'

type Props = TabProps & {
  /** Chamado depois de subir uma foto, para recarregar a configuração no app. */
  onPhotoSaved: () => void
}

type Upload = { kind: 'cover' | 'logo'; error: string | null } | null

/**
 * Identidade e contato.
 *
 * As fotos são salvas na hora, e não junto com o botão "Salvar" do rodapé:
 * upload é uma operação de arquivo, com progresso e erro próprios, e prendê-lo
 * ao salvamento do formulário significaria uma transação que pode falhar pela
 * metade — texto salvo, foto não.
 */
export function ProfileTab({ config, patch, onPhotoSaved }: Props) {
  const [preview, setPreview] = useState<{ cover?: string; logo?: string }>({})
  const [upload, setUpload] = useState<Upload>(null)

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>, kind: 'cover' | 'logo') {
    const file = event.target.files?.[0]
    if (!file) return

    const error = validatePhotoFile(file)
    if (error) {
      setUpload({ kind, error })
      event.target.value = ''
      return
    }

    setUpload({ kind, error: null })
    setPreview((current) => ({ ...current, [kind]: URL.createObjectURL(file) }))

    try {
      await (kind === 'cover' ? updateCoverPhoto(file) : updateLogo(file))
      onPhotoSaved()
      setUpload(null)
    } catch (error) {
      setUpload({
        kind,
        error: error instanceof Error ? error.message : 'Não foi possível enviar a foto.',
      })
    }
  }

  return (
    <>
      <Panel stacked>
        <h2 className={styles.sectionTitle}>Identidade</h2>
        <p className={styles.sectionText}>
          Nome, frase e descrição usados no topo do site, na aba do navegador e na mensagem do
          WhatsApp.
        </p>

        <Input
          label="Nome do restaurante"
          value={config.identity.name}
          onChange={(event) => patch('identity', { name: event.target.value })}
        />

        <Input
          label="Frase de abertura"
          placeholder="ex.: Hambúrgueres artesanais grelhados na brasa"
          value={config.identity.tagline}
          onChange={(event) => patch('identity', { tagline: event.target.value })}
        />

        <Textarea
          label="Descrição"
          rows={3}
          maxLength={280}
          showCount
          value={config.identity.description}
          onChange={(event) => patch('identity', { description: event.target.value })}
        />
      </Panel>

      <Panel stacked>
        <h2 className={styles.sectionTitle}>Imagens</h2>
        <p className={styles.sectionText}>
          A capa aparece na abertura da página inicial e na tela de login. O logo, quando existe,
          entra ao lado do nome na barra de navegação.
        </p>

        <div className={styles.photos}>
          <div className={styles.photo}>
            <ItemPhoto
              url={preview.cover ?? config.identity.coverPhotoUrl}
              alt=""
              width="7rem"
              height="7rem"
              format="rounded"
            />
            <div className={styles.photoControls}>
              <span className={styles.photoLabel}>Foto de capa</span>
              <label className={styles.photoInput}>
                Escolher foto
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => uploadPhoto(event, 'cover')}
                  hidden
                />
              </label>
              {upload?.kind === 'cover' && upload.error ? (
                <span className={styles.photoError}>{upload.error}</span>
              ) : (
                <span className={styles.photoHint}>JPG, PNG ou WEBP, até 5 MB.</span>
              )}
            </div>
          </div>

          <div className={styles.photo}>
            <ItemPhoto
              url={preview.logo ?? config.identity.logoUrl}
              alt=""
              width="4.5rem"
              height="4.5rem"
              format="circular"
            />
            <div className={styles.photoControls}>
              <span className={styles.photoLabel}>Logo</span>
              <label className={styles.photoInput}>
                Escolher logo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => uploadPhoto(event, 'logo')}
                  hidden
                />
              </label>
              {upload?.kind === 'logo' && upload.error ? (
                <span className={styles.photoError}>{upload.error}</span>
              ) : (
                <span className={styles.photoHint}>Quadrado fica melhor.</span>
              )}
            </div>
          </div>
        </div>
      </Panel>

      <Panel stacked>
        <h2 className={styles.sectionTitle}>Contato</h2>

        <div className={styles.twoColumn}>
          <Input
            label="Endereço"
            placeholder="Rua e número"
            value={config.contact.addressStreet}
            onChange={(event) => patch('contact', { addressStreet: event.target.value })}
          />
          <Input
            label="Cidade / UF"
            value={config.contact.addressCity}
            onChange={(event) => patch('contact', { addressCity: event.target.value })}
          />
        </div>

        <div className={styles.twoColumn}>
          <Input
            label="Telefone"
            value={config.contact.phone}
            onChange={(event) => patch('contact', { phone: event.target.value })}
          />
          <Input
            label="WhatsApp (como aparece)"
            placeholder="(62) 99999-0000"
            value={config.contact.whatsappDisplay}
            onChange={(event) => patch('contact', { whatsappDisplay: event.target.value })}
          />
        </div>

        <Input
          label="WhatsApp (número do link)"
          placeholder="5562999990000"
          inputMode="numeric"
          value={config.contact.whatsappNumber}
          onChange={(event) => patch('contact', { whatsappNumber: event.target.value })}
        />

        <div className={styles.twoColumn}>
          <Input
            label="Instagram (link)"
            placeholder="https://instagram.com/…"
            value={config.contact.instagramUrl ?? ''}
            onChange={(event) => patch('contact', { instagramUrl: event.target.value })}
          />
          <Input
            label="Link do mapa"
            placeholder="https://maps.google.com/…"
            value={config.contact.mapsUrl ?? ''}
            onChange={(event) => patch('contact', { mapsUrl: event.target.value })}
          />
        </div>
      </Panel>
    </>
  )
}
