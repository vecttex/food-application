import { Link } from 'react-router-dom'
import { buttonClasses } from '../../components/Button/classes'
import { StatusMessage } from '../../components/StatusMessage'
import { ROUTES } from '../../routes'
import styles from './NotFound.module.css'

export function NotFound() {
  return (
    <div className={styles.page}>
      <p className={styles.code} aria-hidden="true">
        404
      </p>
      <StatusMessage
        type="empty"
        title="Página não encontrada"
        description="O endereço acessado não existe neste site."
        action={
          <div className={styles.actions}>
            <Link to={ROUTES.home} className={buttonClasses({ size: 'md' })}>
              Voltar para o início
            </Link>
            <Link to={ROUTES.menu} className={buttonClasses({ variant: 'ghost', size: 'md' })}>
              Ver cardápio
            </Link>
          </div>
        }
      />
    </div>
  )
}
