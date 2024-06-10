import { Database } from '@paralect/node-mongo'
import { createIndexIfNotExists } from './database-utils'
import env from '~/env'

let db: Database

declare global {
  var __node_mongo_db__: Database
}

if (!global.__node_mongo_db__) {
  // If neither user nor password is set, we assume access control is disabled, so we don't include the ':' and '@'

  console.log('Connecting to MongoDB...')

  db = new Database(env.MONGODB_URI)
  void db.connect()

  void createIndexIfNotExists(db, 'users', 'email', true)
  void createIndexIfNotExists(db, 'passwords', 'userId', true)

  global.__node_mongo_db__ = db
} else {
  db = global.__node_mongo_db__
}

export { db }
