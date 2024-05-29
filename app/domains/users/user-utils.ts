import { Role, User } from '~/domains/users/user-schema'

export function isAdmin(user: User) {
  return user.role === Role.Admin
}
