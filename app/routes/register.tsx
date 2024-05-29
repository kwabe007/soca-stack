import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Link, useSearchParams } from '@remix-run/react'
import { createUser, getUserByEmail } from '~/domains/users/user-queries.server'
import { createUserSession, getUserId } from '~/session.server'
import { safeRedirect } from '~/utils'
import { Role, UserInputSchema } from '~/domains/users/user-schema'
import { withZod } from '@remix-validated-form/with-zod'
import { ValidatedForm, validationError } from 'remix-validated-form'
import { z } from 'zod'
import { Icon } from '@iconify/react'
import { Input } from "~/components/ui/input";
import FieldError from "~/components/FieldError";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request)
  if (userId) return redirect('/')
  return json({})
}

const validator = withZod(
  UserInputSchema.extend({
    redirectTo: z.string().default(''),
  })
)

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = await validator.validate(await request.formData())

  if (result.error) {
    // validationError comes from `remix-validated-form`
    return validationError(result.error)
  }

  const { email, password } = result.data
  const redirectTo = safeRedirect(result.data.redirectTo)

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return validationError(
      {
        fieldErrors: {
          email: 'Email address is already in use',
        },
      },
      result.data
    )
  }

  const user = await createUser({ email, password, role: Role.Member })

  return createUserSession({
    redirectTo,
    remember: false,
    request,
    userId: user._id,
  })
}

export const meta: MetaFunction = () => [{ title: 'Register' }]

export default function Join() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? undefined

  return (
    <div className="relative flex">
      <div className="text-neutral-500 absolute left-12 top-8 flex items-center gap-2">
        <Link
          to={{
            pathname: '/',
            search: searchParams.toString(),
          }}
          className="flex items-center gap-2 font-semibold"
        >
          <Icon icon="material-symbols:arrow-back" className="h-6 w-6" />
          Back to home
        </Link>
      </div>
      <div className="mx-auto w-full max-w-md px-8 mt-[20vh]">
        <ValidatedForm validator={validator} method="post" className="space-y-4">
          <Input className="w-full" name="email" placeholder="E-postadress" />
          <FieldError name="email" />
          <Input className="w-full" name="password" placeholder="Lösenord" type="password" />
          <FieldError name="password" />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Skapa konto
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: '/login',
                  search: searchParams.toString(),
                }}
              >
                Sign in
              </Link>
            </div>
          </div>
        </ValidatedForm>
      </div>
    </div>
  )
}
