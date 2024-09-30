import { Role, User } from '~/domains/users/user-schema'

export function isAdmin(user: User | undefined) {
  return user?.role === Role.Admin
}
