import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { ItemPhoto } from '../../components/ItemPhoto'
import { StatusMessage } from '../../components/StatusMessage'
import { ThemeToggle } from '../../components/ThemeToggle'
import { useAdminAuth } from '../../features/admin/useAdminAuth'
import { useSite } from '../../features/site/useSite'
import { ROUTES } from '../../routes'
import styles from './AdminLogin.module.css'

export function AdminLogin() {
  const { signIn } = useAdminAuth()
  const { config } = useSite()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signIn(email, password)
      navigate(ROUTES.admin)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível entrar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* A foto é decorativa e some no celular: nesse tamanho ela empurraria o
          formulário para baixo da dobra, que é o oposto do que a tela quer. */}
      <div className={styles.cover} aria-hidden="true">
        <ItemPhoto url={config.identity.coverPhotoUrl} alt="" format="large" priority />
        <span className={styles.overlay} />
        <div className={styles.coverText}>
          <p className={styles.coverBrand}>{config.identity.name}</p>
          <p className={styles.coverQuote}>{config.identity.tagline}</p>
        </div>
      </div>

      <div className={styles.column}>
        <div className={styles.card}>
          <div className={styles.top}>
            <div>
              <p className={styles.tag}>Área administrativa</p>
              <h1 className={styles.title}>{config.identity.name}</h1>
            </div>
            {config.appearance.allowThemeToggle ? <ThemeToggle /> : null}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              label="E-mail"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label="Senha"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error ? <StatusMessage type="error" title={error} /> : null}

            <Button type="submit" size="lg" fullWidth disabled={submitting}>
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          <p className={styles.footer}>
            O acesso é liberado por usuário cadastrado como administrador.
          </p>
        </div>
      </div>
    </div>
  )
}
