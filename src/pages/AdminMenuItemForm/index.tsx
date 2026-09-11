import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { buttonClasses } from '../../components/Button/classes'
import { IconButton } from '../../components/IconButton'
import { IconArrowLeft, IconPlus, IconTrash } from '../../components/Icon'
import { Input } from '../../components/Input'
import { ItemPhoto } from '../../components/ItemPhoto'
import { Panel } from '../../components/Panel'
import { Select } from '../../components/Select'
import { StatusMessage } from '../../components/StatusMessage'
import { Switch } from '../../components/Switch'
import { Textarea } from '../../components/Textarea'
import {
  deleteMenuItem,
  emptyFormValues,
  getAdminMenuItem,
  listCategories,
  saveMenuItem,
  toFormValues,
} from '../../features/admin/menuAdminService'
import { validatePhotoFile } from '../../features/admin/validatePhotoFile'
import type { CategoryOption, MenuItemFormValues } from '../../features/admin/types'
import { ROUTES } from '../../routes'
import styles from './AdminMenuItemForm.module.css'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready' }

export function AdminMenuItemForm() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [values, setValues] = useState<MenuItemFormValues>(emptyFormValues())
  const [currentPhotoPath, setCurrentPhotoPath] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([listCategories(), id ? getAdminMenuItem(id) : Promise.resolve(null)])
      .then(([categoryOptions, item]) => {
        if (!active) return
        setCategories(categoryOptions)

        if (item) {
          setValues(toFormValues(item))
          setCurrentPhotoPath(item.photoPath)
          setPhotoPreview(item.photoUrl)
        } else {
          setValues(emptyFormValues(categoryOptions[0]?.slug))
        }

        setLoadState({ status: 'ready' })
      })
      .catch((error: unknown) => {
        if (!active) return
        setLoadState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Erro inesperado ao carregar o item.',
        })
      })

    return () => {
      active = false
    }
  }, [id])

  function updateField<K extends keyof MenuItemFormValues>(field: K, value: MenuItemFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function updateIngredient(index: number, value: string) {
    setValues((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, i) => (i === index ? value : ingredient)),
    }))
  }

  function addIngredient() {
    setValues((current) => ({ ...current, ingredients: [...current.ingredients, ''] }))
  }

  function removeIngredient(index: number) {
    setValues((current) => ({
      ...current,
      ingredients: current.ingredients.filter((_, i) => i !== index),
    }))
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const error = validatePhotoFile(file)
    if (error) {
      setPhotoError(error)
      event.target.value = ''
      return
    }

    setPhotoError(null)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitError(null)
    setSubmitting(true)

    try {
      await saveMenuItem(id ?? null, values, photoFile, currentPhotoPath)
      navigate(ROUTES.adminItems)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Não foi possível salvar o item.')
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    if (!window.confirm(`Excluir "${values.name}"? Essa ação não pode ser desfeita.`)) return

    await deleteMenuItem(id, currentPhotoPath)
    navigate(ROUTES.adminItems)
  }

  if (loadState.status === 'loading') {
    return <StatusMessage type="loading" title="Carregando…" />
  }

  if (loadState.status === 'error') {
    return (
      <StatusMessage type="error" title="Não deu para carregar o item" description={loadState.message} />
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to={ROUTES.adminItems} className={styles.backButton} aria-label="Voltar para o cardápio">
          <IconArrowLeft width={18} height={18} />
        </Link>
        <div>
          <h1 className={styles.title}>{isEditing ? 'Editar item' : 'Novo item'}</h1>
          <p className={styles.subtitle}>
            O que estiver aqui é o que aparece no cardápio e nas vitrines da página inicial.
          </p>
        </div>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Panel stacked>
          <h2 className={styles.sectionTitle}>Foto</h2>
          <div className={styles.photo}>
            <ItemPhoto url={photoPreview} alt="" width="7rem" height="7rem" format="rounded" />
            <div className={styles.photoControls}>
              <label className={styles.photoInput}>
                {photoPreview ? 'Trocar foto' : 'Escolher foto'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  hidden
                />
              </label>
              <span className={styles.photoHint}>JPG, PNG ou WEBP, até 5 MB.</span>
              {photoError ? <span className={styles.photoError}>{photoError}</span> : null}
            </div>
          </div>
        </Panel>

        <Panel stacked>
          <h2 className={styles.sectionTitle}>Descrição</h2>

          <Input
            label="Nome"
            required
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
          />

          <Textarea
            label="Descrição"
            required
            rows={3}
            maxLength={220}
            showCount
            value={values.description}
            onChange={(event) => updateField('description', event.target.value)}
          />

          <div className={styles.twoColumn}>
            <Select
              label="Categoria"
              required
              value={values.category}
              placeholder="Selecione uma categoria"
              onChange={(event) => updateField('category', event.target.value)}
              options={categories.map((category) => ({
                value: category.slug,
                label: category.label,
              }))}
            />

            <Input
              label="Tag (opcional)"
              placeholder="ex.: veggie, picante"
              value={values.tag}
              onChange={(event) => updateField('tag', event.target.value)}
            />
          </div>
        </Panel>

        <Panel stacked>
          <h2 className={styles.sectionTitle}>Preço e ordem</h2>
          <div className={styles.twoColumn}>
            <Input
              label="Preço (R$)"
              type="number"
              min="0"
              step="0.01"
              required
              value={values.priceReais}
              onChange={(event) => updateField('priceReais', event.target.value)}
            />

            <Input
              label="Ordem na lista"
              type="number"
              step="1"
              required
              value={values.sortOrder}
              onChange={(event) => updateField('sortOrder', event.target.value)}
            />
          </div>
        </Panel>

        <Panel stacked>
          <h2 className={styles.sectionTitle}>Exibição</h2>

          <Switch
            label="Disponível no cardápio"
            description="Desligado, o item some da vitrine sem ser excluído."
            checked={values.available}
            onChange={(checked) => updateField('available', checked)}
          />

          <Switch
            label="Destaque na página inicial"
            description="Entra na vitrine “Direto da brasa”."
            checked={values.featured}
            onChange={(checked) => updateField('featured', checked)}
          />

          <Switch
            label="Mais pedido"
            description="Entra na vitrine “Os campeões de pedido”."
            checked={values.bestseller}
            onChange={(checked) => updateField('bestseller', checked)}
          />
        </Panel>

        <Panel stacked>
          <h2 className={styles.sectionTitle}>Ingredientes</h2>
          <p className={styles.sectionText}>
            Aparecem quando a pessoa toca no item. Sem nenhum, o item não abre.
          </p>

          {values.ingredients.map((ingredient, index) => (
            <div key={index} className={styles.ingredientRow}>
              <Input
                label={`Ingrediente ${index + 1}`}
                hiddenLabel
                placeholder={`Ingrediente ${index + 1}`}
                value={ingredient}
                onChange={(event) => updateIngredient(index, event.target.value)}
              />
              <IconButton
                label="Remover ingrediente"
                variant="ghost"
                onClick={() => removeIngredient(index)}
              >
                <IconTrash width={16} height={16} />
              </IconButton>
            </div>
          ))}

          <Button type="button" variant="ghost" size="sm" onClick={addIngredient}>
            <IconPlus width={16} height={16} />
            Adicionar ingrediente
          </Button>
        </Panel>

        {submitError ? <StatusMessage type="error" title={submitError} /> : null}

        <div className={styles.actionsBar}>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? 'Salvando…' : 'Salvar item'}
          </Button>

          <Link to={ROUTES.adminItems} className={buttonClasses({ variant: 'ghost', size: 'lg' })}>
            Cancelar
          </Link>

          {isEditing ? (
            <Button
              type="button"
              variant="danger"
              size="lg"
              className={styles.deleteButton}
              onClick={handleDelete}
            >
              <IconTrash width={16} height={16} />
              Excluir
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  )
}
