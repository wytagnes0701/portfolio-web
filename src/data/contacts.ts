import { mailTo, waTo, webUrl } from '../lib/format'
import { strings } from './strings'
import type { MasterAccountInfo } from './types'
import { YoutubeChannelContent } from './youtube'

export type ContactItem = {
  icon: string
  label: string
  value?: string
  href?: string
  onClick?: () => void
}

export function developerContacts(info: MasterAccountInfo | null): ContactItem[] {
  if (!info) return []
  return [
    {
      icon: '/icons/ic_email.svg',
      label: strings.labelEmail,
      value: info.email,
      href: info.email ? mailTo(info.email) : undefined,
    },
    {
      icon: '/icons/ic_message.svg',
      label: strings.labelWhatsapp,
      value: info.whatsApp,
      href: info.whatsApp ? waTo(info.whatsApp) : undefined,
    },
    {
      icon: '/icons/ic_linkedin.svg',
      label: strings.labelLinkedIn,
      value: info.linkedIn,
      href: info.linkedIn ? webUrl(info.linkedIn) : undefined,
    },
    {
      icon: '/icons/ic_web.svg',
      label: strings.labelWebCv,
      value: info.web,
      href: info.web ? webUrl(info.web) : undefined,
    },
  ].filter((item) => Boolean(item.value))
}

export function youtuberContacts(): ContactItem[] {
  const channel = YoutubeChannelContent
  return [
    {
      icon: '/icons/ic_youtube.svg',
      label: strings.labelYoutube,
      value: strings.youtubeChannelHandle,
      href: channel.channelUrl,
    },
    {
      icon: '/icons/ic_email.svg',
      label: strings.labelEmail,
      value: channel.collabEmail,
      href: mailTo(channel.collabEmail, strings.youtubeCollabEmailSubject),
    },
    {
      icon: '/icons/ic_instagram.svg',
      label: strings.labelInstagram,
      value: channel.instagramHandle,
      href: channel.instagramUrl,
    },
    {
      icon: '/icons/ic_facebook.svg',
      label: strings.labelFacebook,
      value: channel.facebookHandle,
      href: channel.facebookUrl,
    },
  ]
}
