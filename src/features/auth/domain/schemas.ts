import { z } from 'zod'
import { email, name, phone } from '@/shared/domain/fields'

export const loginSchema = z.object({
  username: z.string().trim().min(3, 'نام کاربری یا ایمیل را وارد کنید'),
  password: z.string().min(4, 'گذرواژه حداقل ۴ کاراکتر است'),
})

export const registerSchema = z
  .object({
    firstName: name('نام'),
    lastName: name('نام خانوادگی'),
    username: z
      .string()
      .trim()
      .min(3, 'نام کاربری حداقل ۳ کاراکتر است')
      .max(30, 'حداکثر ۳۰ کاراکتر')
      .regex(/^[a-zA-Z0-9_.]+$/, 'فقط حروف انگلیسی، عدد، _ و . مجاز است'),
    email,
    phone,
    password: z
      .string()
      .min(8, 'گذرواژه حداقل ۸ کاراکتر است')
      .regex(/[A-Za-z]/, 'حداقل یک حرف انگلیسی لازم است')
      .regex(/\d/, 'حداقل یک عدد لازم است'),
    confirm: z.string().min(1, 'تکرار گذرواژه را وارد کنید'),
    terms: z.boolean().refine((value) => value, 'پذیرش قوانین الزامی است'),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'تکرار گذرواژه مطابقت ندارد',
    path: ['confirm'],
  })

export const profileSchema = z.object({
  firstName: name('نام'),
  lastName: name('نام خانوادگی'),
  email,
  phone,
})

export type LoginForm = z.output<typeof loginSchema>
export type RegisterFormInput = z.input<typeof registerSchema>
export type RegisterForm = z.output<typeof registerSchema>
export type ProfileFormInput = z.input<typeof profileSchema>
export type ProfileForm = z.output<typeof profileSchema>
