import type { MetaFunction } from '@remix-run/node'
import { useOptionalUser } from '~/utils'
import { Form } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }]
}

export default function Index() {
  const user = useOptionalUser()

  return (
    <main className="p-16 md:p-8">
      <h1 className="text-3xl mb-8">Welcome to Remix</h1>
      <p className="mb-4">This is a new Remix app.</p>
      <p className="mb-4">
        You can start editing it by opening{' '}
        <code className="bg-gray-200 px-1 py-0.5 rounded-md">app/routes/index.tsx</code>
      </p>
      {user ? (
        <div>
          <p className="mb-4">You are logged in as {user.email}</p>
          <Form method="post" action="/logout">
            <button className="text-blue-500" type="submit">
              Logout
            </button>
          </Form>
        </div>
      ) : (
        <p>
          <a className="text-blue-500" href="/login">
            Login
          </a>
        </p>
      )}
    </main>
  )
}
