import { LinkButton } from '../../../../components/Button'
import { IconInstagram, IconMap, IconPhone, IconPin, IconWhatsApp } from '../../../../components/Icon'
import { InfoRow } from '../../../../components/InfoRow'
import { Panel } from '../../../../components/Panel'
import { Section } from '../../../../components/Section'
import { buildContactLink } from '../../../../features/order/whatsappMessage'
import { useSite } from '../../../../features/site/useSite'
import { HOME_SECTIONS } from '../../../../routes'
import styles from './Contact.module.css'

/** Bloco de contato: endereço, telefone, WhatsApp e redes. */
export function Contact() {
  const { config } = useSite()
  const { contact, sections } = config

  const hasContent =
    contact.addressStreet || contact.phone || contact.whatsappDisplay || contact.instagramUrl

  if (!sections.contact || !hasContent) return null

  return (
    <Section
      id={HOME_SECTIONS.contact}
      eyebrow="Contato"
      title="Fale com a gente"
      description="Dúvida sobre entrega, reserva ou pedido grande? Chama no WhatsApp."
    >
      <div className={styles.grid}>
        <Panel stacked className={styles.panel}>
          {contact.addressStreet || contact.addressCity ? (
            <InfoRow icon={<IconPin width={16} height={16} />} label="Endereço">
              {contact.addressStreet}
              {contact.addressCity ? (
                <>
                  <br />
                  {contact.addressCity}
                </>
              ) : null}
            </InfoRow>
          ) : null}

          {contact.phone ? (
            <InfoRow icon={<IconPhone width={16} height={16} />} label="Telefone">
              {contact.phone}
            </InfoRow>
          ) : null}

          {contact.whatsappDisplay ? (
            <InfoRow icon={<IconWhatsApp width={16} height={16} />} label="WhatsApp">
              {contact.whatsappDisplay}
            </InfoRow>
          ) : null}
        </Panel>

        <div className={styles.actions}>
          {contact.whatsappNumber ? (
            <LinkButton href={buildContactLink(config)} size="lg" fullWidth>
              <IconWhatsApp width={18} height={18} />
              Abrir conversa no WhatsApp
            </LinkButton>
          ) : null}

          {contact.mapsUrl ? (
            <LinkButton href={contact.mapsUrl} variant="ghost" size="md" fullWidth>
              <IconMap width={16} height={16} />
              Como chegar
            </LinkButton>
          ) : null}

          {contact.instagramUrl ? (
            <LinkButton href={contact.instagramUrl} variant="ghost" size="md" fullWidth>
              <IconInstagram width={16} height={16} />
              Seguir no Instagram
            </LinkButton>
          ) : null}
        </div>
      </div>
    </Section>
  )
}
