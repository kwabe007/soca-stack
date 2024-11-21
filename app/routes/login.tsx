import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Link, useSearchParams } from '@remix-run/react'
import { createUserSession, getUserId } from '~/session.server'
import { safeRedirect } from '~/utils'
import { verifyLogin } from '~/domains/users/user-queries.server'
import { useField, ValidatedForm, validationError } from 'remix-validated-form'
import { withZod } from '@remix-validated-form/with-zod'
import { UserInputSchema } from '~/domains/users/user-schema'
import { z } from 'zod'
import { Icon } from '@iconify/react'
import { Input } from '~/components/ui/input'
import FieldError from '~/components/FieldError'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request)
  if (userId) return redirect('/')
  return json({})
}

const validator = withZod(
  UserInputSchema.extend({
    redirectTo: z.string().default(''),
    remember: z.string().optional(),
  })
)

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = await validator.validate(await request.formData())

  if (result.error) {
    // validationError comes from `remix-validated-form`
    return validationError(result.error)
  }

  const { email, password, remember } = result.data
  const redirectTo = safeRedirect(result.data.redirectTo)

  const user = await verifyLogin(email, password)

  if (!user) {
    return validationError({
      fieldErrors: {
        form: 'Wrong email or password',
      },
    })
  }

  return createUserSession({
    redirectTo,
    remember: remember === 'on',
    request,
    userId: user._id,
  })
}

export const meta: MetaFunction = () => [{ title: 'Login' }]

export default function LoginRoute() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const { error } = useField('form', { formId: 'login' })

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
      <div className="relative mt-[20vh] mx-auto w-full max-w-md px-8">
        <ValidatedForm id="login" validator={validator} method="post" className="space-y-4">
          <Input name="email" placeholder="Email" />
          <FieldError name="email" />
          <Input name="password" placeholder="Password" type="password" />
          <FieldError name="password" />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white font-medium hover:bg-blue-600 focus:bg-blue-400"
          >
            Logga in
          </button>
          {error && <div className="text-red-700 text-sm">{error}</div>}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 block text-sm">
                Remember me
              </label>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: '/register',
                  search: searchParams.toString(),
                }}
              >
                Register now
              </Link>
              .
            </div>
          </div>
        </ValidatedForm>
      </div>
    </div>
  )
}
