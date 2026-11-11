# Atlas scripts

`atlas.ts` reads the verifier-plus credentials collection in MongoDB Atlas, the store that `verifierplus.org` used before 3.0.0. It is run by hand, from a maintainer's machine, with a database user that can only read. It is not part of the app, its build or CI.

```sh
npx tsx scripts/atlas/atlas.ts <command>
```

## Settings

From the environment only. There are no flags for them, so a connection string never lands in shell history as part of a command.

| Variable | Default | |
|---|---|---|
| `ATLAS_URI` | none; required | The read-only user's connection string, such as `mongodb+srv://<user>:<password>@<host>/` |
| `ATLAS_DB` | `verifier-plus` | The database, as in the app |
| `ATLAS_COLLECTION` | `credentials` | The collection, as in the app |

The script refuses to run without `ATLAS_URI`. Before reading anything it prints the host it is about to read, never the user name or password.

## `scan`

Reports what is in the collection without printing any of it. Reads only, with read preference `secondaryPreferred`.

1. Lists the collection's indexes: each one's name, key and options, including any `expireAfterSeconds`.
2. Reads every document's `id`, `createdAt`, `shared` and `vp`, and keeps only counts and sizes. A presentation's size is `Buffer.byteLength(JSON.stringify(vp), 'utf8')`, the measure the app's 350 KB limit on sharing uses.
3. Prints:
   - counts: documents; shared; unshared; `shared` missing or not a boolean; shared and unexpired (`createdAt` less than 365 days ago); `createdAt` missing or not a date; `id` missing or not a v4 UUID; `vp` missing;
   - `vp` size, among all documents and among the shared and unexpired: max, p50, p90 and p99 (nearest rank), and how many are over 350 KB (358,400 bytes) and over 400 KB (DynamoDB's item limit);
   - the oldest and newest `createdAt` among the shared and unexpired.

A document without a valid `createdAt` cannot be dated, so it is never counted as unexpired.

Run it like this, then clear the variable:

```sh
export ATLAS_URI='mongodb+srv://<user>:<password>@<host>/'
npx tsx scripts/atlas/atlas.ts scan
unset ATLAS_URI
```

To try it locally first, against a MongoDB with no data you care about:

```sh
docker run -d --name atlas-scan-mongo -p 27017:27017 mongo:7
ATLAS_URI=mongodb://localhost:27017 npx tsx scripts/atlas/atlas.ts scan
```

## What it never does

- Write anything: no inserts, updates, deletes, and no index creation. Give it a user with the built-in `read` role on the one database, and it could not if it tried.
- Print a credential id, a holder DID (`controller`), or any part of a stored presentation. Output is aggregates and index definitions only.
- Print the connection string, the user name or the password, including in its own error messages.
- Read settings from flags or files.
