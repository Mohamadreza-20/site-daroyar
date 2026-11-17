import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

const restrict = (...patterns: { group: string[]; message: string }[]) => ({
  '@typescript-eslint/no-restricted-imports': ['error', { patterns }],
  'no-restricted-imports': 'off',
})

const FRAMEWORKS = [
  'react',
  'react-dom',
  'react-dom/*',
  'react-router',
  'react-hook-form',
  '@hookform/*',
  '@tanstack/*',
  'axios',
  'zustand',
  'zustand/*',
  'sonner',
  'lucide-react',
  'framer-motion',
  'swiper',
  'swiper/*',
  'recharts',
  'tailwind-merge',
]

const NO_UI = ['@/**/components/**', '@/**/pages/**', '@/shared/ui/**']
const NO_DATA = ['@/**/data/**']
const NO_HOOKS = ['@/**/hooks/**']

export default defineConfig(
  { ignores: ['dist', 'node_modules', 'server/.data'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-restricted-syntax': [
        'error',
        { selector: 'ClassDeclaration', message: 'فقط برنامه‌نویسی تابعی؛ class ممنوع است.' },
        { selector: 'ClassExpression', message: 'فقط برنامه‌نویسی تابعی؛ class ممنوع است.' },
        { selector: 'ThisExpression', message: 'فقط برنامه‌نویسی تابعی؛ this ممنوع است.' },
      ],
      'arrow-body-style': ['error', 'as-needed'],
      'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
      'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/**/domain/**/*.ts'],
    rules: restrict(
      { group: FRAMEWORKS, message: 'domain: فقط منطق بیزینس خالص (بدون React، HTTP، state و UI).' },
      { group: [...NO_UI, ...NO_DATA, ...NO_HOOKS], message: 'domain به لایه‌های data / hooks / ui وابسته نیست.' },
    ),
  },
  {
    files: ['src/**/data/**/*.ts'],
    rules: restrict(
      {
        group: [
          'react-router',
          'react-hook-form',
          '@hookform/*',
          'sonner',
          'lucide-react',
          'framer-motion',
          'swiper',
          'swiper/*',
          'recharts',
          'tailwind-merge',
        ],
        message: 'data: فقط دسترسی به داده، کش و state؛ بدون منطق UI.',
      },
      { group: [...NO_UI, ...NO_HOOKS], message: 'data به hooks یا ui وابسته نیست.' },
    ),
  },
  {
    files: ['src/**/hooks/**/*.ts', 'src/**/hooks/**/*.tsx'],
    rules: restrict(
      {
        group: [
          'axios',
          '@/**/data/api',
          '@/shared/data/client',
          'lucide-react',
          'framer-motion',
          'swiper',
          'swiper/*',
          'recharts',
          'tailwind-merge',
        ],
        message: 'hooks: منطق UI/ارکستریشن؛ فراخوانی مستقیم HTTP و رندر ممنوع است.',
      },
      { group: ['@/**/components/**', '@/**/pages/**'], message: 'hooks به کامپوننت‌ها وابسته نیست.' },
    ),
  },
  {
    files: ['src/**/components/**/*.{ts,tsx}', 'src/**/pages/**/*.{ts,tsx}', 'src/shared/ui/**/*.{ts,tsx}'],
    ignores: ['src/shared/ui/uiStore.ts'],
    rules: restrict(
      {
        group: ['axios', 'zustand', 'zustand/*', '@tanstack/*', '@hookform/*'],
        message: 'ui: فقط رندر؛ داده و state سراسری از hooks می‌آید.',
      },
      { group: NO_DATA, message: 'ui مستقیم از لایهٔ data استفاده نمی‌کند؛ از hooks استفاده کنید.' },
    ),
  },
  { files: ['server/types.ts'], rules: { '@typescript-eslint/no-namespace': 'off' } },
)
