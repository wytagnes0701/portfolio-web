import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { TechoDialog } from '../components/Dialogs'
import { AboutCard } from '../components/sections'
import { Card, ContactGroup, PageWrap, SectionHeading, SettingsRow } from '../components/ui'
import { developerContacts, youtuberContacts } from '../data/contacts'
import { usePortfolio } from '../data/PortfolioContext'
import { strings } from '../data/strings'
import { mailTo, webUrl } from '../lib/format'

export function MorePage() {
  const navigate = useNavigate()
  return (
    <PageWrap>
      <SectionHeading eyebrow="menu" title={strings.labelMore} />
      <Card className="mx-auto max-w-xl p-4">
        <SettingsRow icon="/icons/ic_personal.svg" label={strings.labelAbout} onClick={() => navigate('/about')} />
        <SettingsRow icon="/icons/icon_info.svg" label={strings.labelContact} onClick={() => navigate('/contact')} />
      </Card>
    </PageWrap>
  )
}

export function AboutPage() {
  return (
    <PageWrap>
      <SectionHeading eyebrow={strings.aboutEyebrow} title={strings.labelAbout} />
      <AboutCard compact />
    </PageWrap>
  )
}

export function ContactPage() {
  const { accountInfo, snapshot, youtubeSocial } = usePortfolio()
  const [picker, setPicker] = useState<string | null>(null)
  const [qr, setQr] = useState<string | null>(null)

  const developer = developerContacts(accountInfo).map((item) => {
    if (item.label === strings.labelLinkedIn || item.label === strings.labelWebCv) {
      return { ...item, href: undefined, onClick: () => item.value && setPicker(item.value) }
    }
    if (item.label === strings.labelEmail && item.value) {
      return { ...item, href: mailTo(item.value, 'Title', 'Content') }
    }
    return item
  })

  return (
    <PageWrap>
      <SectionHeading eyebrow={strings.contactEyebrow} title={strings.labelContact} />
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <ContactGroup
          title={strings.contactDeveloper}
          subtitle={strings.developerInvite}
          items={developer}
          variant="row"
        />
        <ContactGroup
          title={strings.contactYoutuber}
          subtitle={strings.youtubeSocialInvite}
          items={youtuberContacts(snapshot.youtubeChannel, youtubeSocial)}
          variant="row"
        />
      </div>
      {picker ? (
        <TechoDialog title={strings.selectContactDisplay} confirmLabel={strings.cancel} onConfirm={() => setPicker(null)}>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="text-left text-nav"
              onClick={() => {
                setQr(picker)
                setPicker(null)
              }}
            >
              {strings.contactQr}
            </button>
            <button
              type="button"
              className="text-left text-nav"
              onClick={() => {
                window.open(webUrl(picker), '_blank')
                setPicker(null)
              }}
            >
              {strings.contactRedirect}
            </button>
          </div>
        </TechoDialog>
      ) : null}
      {qr ? (
        <TechoDialog title={strings.scanQr} confirmLabel={strings.cancel} onConfirm={() => setQr(null)}>
          <div className="flex justify-center bg-white p-4">
            <QRCodeSVG value={qr} size={220} />
          </div>
        </TechoDialog>
      ) : null}
    </PageWrap>
  )
}
