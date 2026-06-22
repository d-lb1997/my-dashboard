import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'glassDark',
    themes: {
      glassDark: {
        dark: true,
        colors: {
          background: '#0a0b0d',
          surface: 'rgba(255, 255, 255, 0.03)',
          'surface-bright': '#141618',
          'surface-light': '#1a1c1f',
          'surface-variant': '#1e2024',
          'on-surface-variant': 'rgba(255, 255, 255, 0.45)',
          primary: '#00f2ff',
          'primary-darken-1': '#00c4d4',
          secondary: 'rgba(255, 255, 255, 0.08)',
          error: '#ff6b6b',
          info: '#00f2ff',
          success: '#00f2ff',
          warning: '#ffb347',
          'on-background': '#ffffff',
          'on-surface': '#ffffff',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})
