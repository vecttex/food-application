import { Input } from '../../../../components/Input'
import type { AddressField, DeliveryAddress } from '../../types'
import styles from './AddressForm.module.css'

type Props = {
  address: DeliveryAddress
  onChange: (field: AddressField, value: string) => void
}

/**
 * Formulário de entrega.
 *
 * Componente controlado e sem estado próprio: quem guarda o endereço é o
 * `AddressProvider`. Isso deixa o formulário puramente de apresentação e
 * testável passando um objeto e um spy.
 *
 * `autoComplete` preenchido nos campos padrão do HTML — em celular isso é a
 * diferença entre um toque e trinta segundos digitando.
 */
export function AddressForm({ address, onChange }: Props) {
  return (
    <div className={styles.form}>
      <p className={styles.title}>Endereço de entrega</p>

      <Input
        label="Rua e número"
        hiddenLabel
        placeholder="Rua e número"
        value={address.street}
        autoComplete="street-address"
        onChange={(event) => onChange('street', event.target.value)}
      />

      <div className={styles.twoColumn}>
        <Input
          label="Bairro"
          hiddenLabel
          placeholder="Bairro"
          value={address.neighborhood}
          autoComplete="address-level3"
          onChange={(event) => onChange('neighborhood', event.target.value)}
        />
        <Input
          label="Complemento"
          hiddenLabel
          placeholder="Complemento"
          value={address.complement}
          autoComplete="address-line2"
          onChange={(event) => onChange('complement', event.target.value)}
        />
      </div>

      <Input
        label="Ponto de referência (opcional)"
        hiddenLabel
        placeholder="Ponto de referência (opcional)"
        value={address.reference}
        onChange={(event) => onChange('reference', event.target.value)}
      />
    </div>
  )
}
