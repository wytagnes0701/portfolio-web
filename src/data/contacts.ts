import { mailTo, waTo, webUrl } from '../lib/format'
import { strings } from './strings'
import type { MasterAccountInfo, YoutubeChannel, YoutubeSocial } from './types'

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

export function youtuberSocialContacts(
  channel: YoutubeChannel,
  social: YoutubeSocial,
): ContactItem[] {
  return [
    {
      icon: '/icons/ic_youtube.svg',
      label: strings.labelYoutube,
      value: channel.handle,
      href: social.channelUrl,
    },
    {
      icon: '/icons/ic_instagram.svg',
      label: strings.labelInstagram,
      value: social.instagramHandle,
      href: social.instagramUrl,
    },
    {
      icon: '/icons/ic_facebook.svg',
      label: strings.labelFacebook,
      value: social.facebookHandle,
      href: social.facebookUrl,
    },
  ].filter((item) => Boolean(item.value))
}

export function youtubeCollabContacts(
  channel: YoutubeChannel,
  contact: MasterAccountInfo | null,
): ContactItem[] {
  return [
    {
      icon: '/icons/ic_email.svg',
      label: strings.labelEmail,
      value: channel.collabEmail,
      href: channel.collabEmail ? mailTo(channel.collabEmail, strings.youtubeCollabEmailSubject) : undefined,
    },
    {
      icon: '/icons/ic_message.svg',
      label: strings.labelWhatsapp,
      value: contact?.whatsApp,
      href: contact?.whatsApp ? waTo(contact.whatsApp) : undefined,
    },
  ].filter((item) => Boolean(item.value))
}

export function youtuberContacts(channel: YoutubeChannel, social: YoutubeSocial): ContactItem[] {
  const collabEmail = channel.collabEmail
    ? {
        icon: '/icons/ic_email.svg',
        label: strings.labelEmail,
        value: channel.collabEmail,
        href: mailTo(channel.collabEmail, strings.youtubeCollabEmailSubject),
      }
    : null
  const socialItems = youtuberSocialContacts(channel, social)
  return [
    socialItems.find((item) => item.label === strings.labelYoutube),
    collabEmail,
    ...socialItems.filter((item) => item.label !== strings.labelYoutube),
  ].filter((item): item is ContactItem => item != null)
}
