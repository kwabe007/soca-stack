import { z } from 'zod'

export enum Role {
  Admin = 'admin',
  Member = 'member',
}

export const UserSchema = z.object({
  _id: z.string(),
  email: z.string().email('Ogiltig e-postadress.'),
  role: z.nativeEnum(Role).default(Role.Member),
})
export type User = z.infer<typeof UserSchema>

export const PasswordSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  hash: z.string(),
})
export type Password = z.infer<typeof PasswordSchema>

export const UserWithPasswordSchema = UserSchema.extend({
  password: PasswordSchema,
})
export type UserWithPassword = z.infer<typeof UserWithPasswordSchema>

export const UserInputSchema = UserSchema.pick({
  email: true,
}).extend({
  password: z.string().min(8, 'Lösenordet måste vara minst 8 tecken långt.'),
})
export type UserInput = z.infer<typeof UserInputSchema>
