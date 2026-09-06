export type Skill = {
  index: number
  key: string
  label: string
  icon: string
}

export const SKILLS: Skill[] = [
  { index: 1, key: 'ANDROID', label: 'Android', icon: '/icons/outline_android_24.svg' },
  { index: 2, key: 'IOS', label: 'iOS', icon: '/icons/outline_ios.svg' },
  { index: 3, key: 'UNITY', label: 'Unity', icon: '/icons/outline_unity.svg' },
  { index: 4, key: 'JAVA', label: 'JAVA', icon: '/icons/outline_java.svg' },
  { index: 5, key: 'KOTLIN', label: 'Kotlin', icon: '/icons/outline_kotlin.svg' },
  { index: 6, key: 'C_SHARP', label: 'C#', icon: '/icons/outline_c_sharp.svg' },
  { index: 7, key: 'SWIFT', label: 'Swift', icon: '/icons/outline_swift.svg' },
  { index: 8, key: 'AS3', label: 'Flash/ ActionScript', icon: '/icons/outline_as3.svg' },
  { index: 9, key: 'HTML', label: 'HTML', icon: '/icons/outline_html5.svg' },
  { index: 10, key: 'PHP', label: 'PHP', icon: '/icons/outline_php.svg' },
  { index: 11, key: 'CSS', label: 'CSS', icon: '/icons/outline_css.svg' },
  { index: 12, key: 'JS', label: 'JavaScript', icon: '/icons/outline_javascript.svg' },
  { index: 13, key: 'X3DOM', label: 'X3DOM', icon: '/images/x3dom.png' },
  { index: 14, key: 'DB', label: 'Database', icon: '/icons/outline_database.svg' },
  { index: 15, key: 'ARDUINO', label: 'Arduino', icon: '/icons/outline_arduino.svg' },
  { index: 16, key: 'COLOR_DETECTION', label: 'Color Detection', icon: '/images/color_detection.jpeg' },
  { index: 17, key: 'PHOTO_BOOTH', label: 'Photo Booth', icon: '/icons/outline_photobooth.svg' },
  { index: 18, key: 'VIDEO_BOOTH', label: 'Video Booth', icon: '/icons/outline_videobooth.svg' },
  { index: 19, key: 'ANI_3D', label: '2D Animation', icon: '/icons/outline_3d_animation.svg' },
  { index: 20, key: 'MODEL_3D', label: '3D Modelling', icon: '/icons/outline_3d_modelling.svg' },
  { index: 21, key: 'MAYA', label: 'MAYA', icon: '/icons/outline_maya.svg' },
  { index: 22, key: 'THREE_DS_MAX', label: '3Ds Max', icon: '/icons/outline_3dsmax.svg' },
  { index: 23, key: 'AE', label: 'After Effects', icon: '/icons/outline_after_effect.svg' },
  { index: 24, key: 'KINECT', label: 'Kinect', icon: '/icons/outline_kinect.svg' },
  { index: 25, key: 'MOTION_DETECTION', label: 'Motion Detection', icon: '/icons/outline_motion_detection.svg' },
  { index: 26, key: 'VR', label: 'VR', icon: '/icons/outline_vr.svg' },
  { index: 27, key: 'AR', label: 'AR', icon: '/icons/outline_ar.svg' },
  { index: 28, key: 'EASY_AR', label: 'EasyAR', icon: '/images/easy_ar.png' },
  { index: 29, key: 'ARKIT', label: 'ARKit', icon: '/icons/outline_arkit.svg' },
  { index: 30, key: 'QR', label: 'QR Scanning', icon: '/icons/outline_qr.svg' },
  { index: 31, key: 'BARCODE', label: 'Bar Code Scanning', icon: '/icons/outline_barcode.svg' },
  { index: 32, key: 'VIDEO', label: 'Video Production', icon: '/icons/outline_movie_creation_24.svg' },
  { index: 33, key: 'LIVE_TV', label: 'Live Video Production', icon: '/icons/outline_live_tv_24.svg' },
  { index: 34, key: 'INTERACT_WALL', label: 'Interactive Wall', icon: '/icons/outline_interactive_wall.svg' },
  { index: 35, key: 'ICADE', label: 'iCade', icon: '/icons/outline_icade.svg' },
  { index: 36, key: 'MARKETING', label: 'Marketing', icon: '/icons/outline_marketing.svg' },
  { index: 37, key: 'WEB', label: 'Web Programming', icon: '/icons/outline_web_24.svg' },
  { index: 38, key: 'VIDEO_360', label: '360 degree VR app', icon: '/icons/outline_vr360.svg' },
  { index: 39, key: 'PROJECTION', label: 'Projection', icon: '/icons/outline_projection.svg' },
  { index: 40, key: 'DIGITAL_PAYMENT', label: 'Digital Payment', icon: '/icons/outline_digital_payment.svg' },
  { index: 41, key: 'FIREBASE', label: 'Firebase', icon: '/icons/outline_firebase.svg' },
]

export function skillsFromTagIndex(tagIndex: number[]) {
  return tagIndex
    .map((idx) => SKILLS.find((skill) => skill.index === idx))
    .filter((skill): skill is Skill => skill != null)
}

export const PROJECT_TYPES = [
  { id: 1, key: 'APP_DEVELOPMENT', label: 'APP DEVELOPMENT' },
  { id: 2, key: 'VR_AR', label: 'VR/ AR' },
  { id: 3, key: 'PHOTO_VIDEO_BOOTH', label: 'PHOTO VIDEO BOOTH' },
  { id: 4, key: 'ARDUINO_POWERED_INTERACTIVE_GAME', label: 'ARDUINO-POWERED INTERACTIVE GAME' },
  { id: 5, key: 'MOTION_TRACKING_INTERACTIVE_GAME', label: 'MOTION-TRACKING INTERACTIVE GAME' },
  { id: 6, key: 'THREE_D_ANIMATION_MODELLING', label: '3D ANIMATION MODELLING' },
  { id: 7, key: 'VIDEO_PRODUCTION', label: 'VIDEO PRODUCTION' },
  { id: 8, key: 'WEB_PROGRAMMING', label: 'WEB PROGRAMMING' },
] as const
