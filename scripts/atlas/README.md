# Atlas scripts

`atlas.ts` moves the verifier-plus credentials collection from MongoDB Atlas, the store that `verifierplus.org` used before 3.0.0, to the DynamoDB table the app uses on Lambda. It is run by hand, from a maintainer's machine. It is not part of the app, its build or its deployment; CI runs its tests only.

```sh
npx tsx scripts/atlas/atlas.ts <command> [options]
```

| Command | What it does |
|---|---|
| [`scan`](#scan) | Reports what is in the Atlas collection, as counts and sizes. Reads only. |
| [`synthetic`](#synthetic) | Writes a generated data set in Atlas's record shape into a MongoDB on this machine, to rehearse `copy` with. |
| [`copy`](#copy) | Copies the shared, unexpired credentials from a MongoDB collection into a DynamoDB table. A dry run unless `--write` is given. |

**Real Atlas data never goes to staging.** The rehearsal copies a `synthetic` data set; only the production run reads Atlas, and it writes only to the production table.

## Settings

From the environment only. There are no flags for them, so a connection string never lands in shell history as part of a command.

| Variable | Read by | Default | |
|---|---|---|---|
| `ATLAS_URI` | `scan` | none; required | The read-only Atlas user's connection string, such as `mongodb+srv://<user>:<password>@<host>/` |
| `ATLAS_DB` | `scan` | `verifier-plus` | The database, as in the app |
| `ATLAS_COLLECTION` | `scan` | `credentials` | The collection, as in the app |
| `SOURCE_URI` | `copy`, `synthetic` | none; required | The collection to copy from: the read-only Atlas user for the production run, a local MongoDB for the rehearsal. `synthetic` writes to it, so for `synthetic` it must be local |
| `SOURCE_DB` | `copy`, `synthetic` | `verifier-plus` | |
| `SOURCE_COLLECTION` | `copy`, `synthetic` | `credentials` | |
| `CREDENTIAL_TTL_DAYS` | `copy`, `synthetic` | `365` | How long a shared credential lasts, read as the app reads it. Leave it unset unless the deployed app sets it |
| `AWS_PROFILE` | `copy` | | The AWS credentials to write with, through the AWS SDK's usual chain |
| `DYNAMODB_ENDPOINT` | `copy` | unset | DynamoDB Local, for testing only; see `--expect-account local` |

`copy` and `synthetic` read `SOURCE_*` rather than `ATLAS_*` because their source is Atlas only in the production run: in the rehearsal it is a MongoDB on your machine, and `synthetic` refuses anything else. `scan` only ever reads Atlas.

Every command prints the host it is about to use, never the user name or password, and refuses to run without its URI.

## `scan`

Reports what is in the collection without printing any of it. Reads only, with read preference `secondaryPreferred`.

1. Lists the collection's indexes: each one's name, key and options, including any `expireAfterSeconds`.
2. Reads every document's `id`, `createdAt`, `shared` and `vp`, and keeps only counts and sizes. A presentation's size is `Buffer.byteLength(JSON.stringify(vp), 'utf8')`, the measure the app's 350 KB limit on sharing uses.
3. Prints:
   - counts: documents; shared; unshared; `shared` missing or not a boolean; shared and unexpired (`createdAt` less than 365 days ago); `createdAt` missing or not a date; `id` missing or not a v4 UUID; `vp` missing;
   - `vp` size, among all documents and among the shared and unexpired: max, p50, p90 and p99 (nearest rank), and how many are over the app's limit (`MAX_SHARED_VP_BYTES`, 358,400 bytes) and over 400 KB (DynamoDB's item limit);
   - the oldest and newest `createdAt` among the shared and unexpired.

A document without a valid `createdAt` cannot be dated, so it is never counted as unexpired. The limit and the 365 days are the app's own constants, imported, so the scan follows them if they change.

Run it like this, then clear the variable:

```sh
export ATLAS_URI='mongodb+srv://<user>:<password>@<host>/'
npx tsx scripts/atlas/atlas.ts scan
unset ATLAS_URI
```

## `synthetic`

```sh
SOURCE_URI=mongodb://localhost:27017 npx tsx scripts/atlas/atlas.ts synthetic [--count 50]
```

Writes `--count` documents (default 50, at least 10) in Atlas's 2.x record shape, `{ _id, id, controller, createdAt, vp, shared }` with no `expiresAt`, into an empty collection, then creates a TTL index on `createdAt` like the one Atlas has. The presentations are the repository's test fixtures (`tests/fixtures`), each with a fresh `id`, and a made-up `did:key` as holder and `controller`.

- **Refuses any host but `localhost` or `127.0.0.1`**, before connecting, and then talks to that one server only (`directConnection`). It exists so that no real data is ever needed for the rehearsal.
- Refuses a collection that already has documents. Drop it, or set `SOURCE_DB` or `SOURCE_COLLECTION`.

The set always has: one unshared record; one over the app's size limit (an embedded PNG sized from `MAX_SHARED_VP_BYTES` plus 16 KB); one with `createdAt` stored as a string, which `copy` must skip as malformed; one created 364 days ago, which expires the next day; and three with embedded images under the limit, the largest 16 KB under it. The rest are spread from 1 to 400 days old, so the oldest have expired. The image records' credentials were changed to add the image, so the app shows them as not verified; that is expected.

It prints what it made and what `copy` should report for it, and until when that holds: after the 364-day record expires, each record moves from written to expired as it passes 365 days.

The TTL index makes MongoDB delete the expired documents within about a minute, as Atlas does, so `copy` will count anywhere from none of them to all of them as expired.

**The TTL index is assumed, not confirmed:** `expireAfterSeconds` 31,536,000 (365 days), `ATLAS_TTL_INDEX_SECONDS` in `synthetic.ts`. Confirm it against the index `scan` prints for production Atlas, and correct the constant if it differs.

## `copy`

```sh
SOURCE_URI=... AWS_PROFILE=<profile> \
npx tsx scripts/atlas/atlas.ts copy --table <table name> --expect-account <account id> [--write] [--sample-links <n>]
```

1. **Checks the account first.** It asks AWS whose credentials these are (`sts:GetCallerIdentity`) and refuses unless the account is `--expect-account`. It prints the account, the table, and the source's host.
2. Reads the source with read preference `secondaryPreferred`, and **never writes to it**.
3. Selects each document that is shared and unexpired (`createdAt` plus `CREDENTIAL_TTL_DAYS` is still in the future), and skips the rest by reason:
   - **malformed**: `id` not a v4 UUID, `controller` not a string, `createdAt` not a date, `vp` not an object, or `shared` not a boolean. Nothing is guessed or filled in;
   - **unshared**;
   - **expired**;
   - **too large**: `vp` over `MAX_SHARED_VP_BYTES`, the app's own limit on sharing, imported from the app.
4. Writes each selected record as `{ id, controller, createdAt, expiresAt: createdAt + TTL, vp, shared: true }` through the app's own `dynamodb` store, so the item is exactly what the app would have written. `_id` is dropped; `id` and `createdAt` are kept, so old links keep working and expiry stays where it was. Ten writes at a time.

**A dry run unless `--write` is given**: it reads, selects and counts, and checks that it can read the table, but writes nothing. A dry run does not check which records are already in the table.

**Safe to run again.** The store's `put` creates an item only if its `id` is absent, so a record copied by an earlier run is counted as "already present", not as an error.

**Prints counts only**: read; selected; written; already present; skipped as unshared, expired, too large or malformed; errors, by error name. Never an id, a holder DID or any content. It exits 1 if any write failed for another reason than "already present".

`--sample-links <n>` (with `--write`, up to 20) also prints `n` paths, `/credentials/<id>`, of records it wrote or found present, to open in a browser. **Only for the staging account (364323832338)**, whose data is synthetic: it refuses for any other account.

`--expect-account local` is for tests: it is allowed only when `DYNAMODB_ENDPOINT` is set, writes to DynamoDB Local there, and skips the AWS account check. It signs with the access key `test`; a DynamoDB Local started without `-sharedDb` keeps a separate set of tables per access key, so create the table with that key too. Any real account is refused while `DYNAMODB_ENDPOINT` is set.

## The rehearsal, in staging

Copies a synthetic data set, never real data, to the staging table, and checks the app serves it.

```sh
docker run -d --name atlas-rehearsal-mongo -p 27017:27017 mongo:7
export SOURCE_URI=mongodb://localhost:27017
npx tsx scripts/atlas/atlas.ts synthetic                     # note the expected copy result

export AWS_PROFILE=dcc-staging
npx tsx scripts/atlas/atlas.ts copy --table <staging table> --expect-account 364323832338
npx tsx scripts/atlas/atlas.ts copy --table <staging table> --expect-account 364323832338 --write --sample-links 5
npx tsx scripts/atlas/atlas.ts copy --table <staging table> --expect-account 364323832338 --write   # all "already present"

unset SOURCE_URI AWS_PROFILE
docker rm -f atlas-rehearsal-mongo
```

Compare the counts with what `synthetic` said to expect. Open each sample link on `https://verifierplus.staging.dccommons.org`, for example `https://verifierplus.staging.dccommons.org/credentials/<id>`: the credential shows, and the image records show their image.

## The production run

Reads Atlas with the read-only user, and writes to the production table. Run it before the DNS switch, and again after it to pick up anything shared on the old server in between.

```sh
export SOURCE_URI='mongodb+srv://<read-only user>:<password>@<host>/'
export AWS_PROFILE=dcc-prod
npx tsx scripts/atlas/atlas.ts copy --table <prod table> --expect-account 065533220189            # dry run
npx tsx scripts/atlas/atlas.ts copy --table <prod table> --expect-account 065533220189 --write    # before the DNS switch
# switch DNS, then:
npx tsx scripts/atlas/atlas.ts copy --table <prod table> --expect-account 065533220189 --write    # after it
unset SOURCE_URI AWS_PROFILE
```

`<prod table>` is the table name in the production stack's outputs. Each run's selected count should be close to what `scan` reported as shared and unexpired, less those over the limit or malformed, and less any that expired between the two.

## Trying it locally

```sh
docker compose -f docker-compose.test.yml up -d
npm run test:stores
```

`scripts/atlas/rehearsal.test.ts` runs `synthetic` into the test MongoDB, `copy --write` into a DynamoDB Local table, reads a copied record back through the app's credential service, and checks that a second run finds everything already present. `copy.test.ts` covers selection, mapping, the account check and the generator without any database.

## What it never does

- Write to Atlas, or to any source `copy` reads. `scan` and `copy` only read; give them a user with the built-in `read` role on the one database, and they could not write if they tried. `synthetic` writes only to a MongoDB on this machine.
- Write to an AWS account other than `--expect-account`, or write at all without `--write`.
- Print a credential id, a holder DID (`controller`), or any part of a stored presentation, except `copy`'s sample links in staging.
- Print the connection string, the user name or the password, including in its own error messages.
- Read settings from flags or files.
