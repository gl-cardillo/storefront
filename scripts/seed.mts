import mongoose from "mongoose";
import User from "../models/User.ts";
import Product from "../models/Product.ts";
import Review from "../models/Review.ts";
import Order from "../models/Order.ts";
import { TEST_ACCOUNT_EMAIL } from "../utils/constants.ts";

// copies the catalogue and the test account into a dev or test database

const source = process.env.PROD_MONGO_URI;
const target = process.env.MONGO_URI;
if (!source || !target) {
  throw new Error("PROD_MONGO_URI and MONGO_URI must both be set");
}

const dbName = (uri: string) => new URL(uri).pathname.slice(1);
const targetDb = dbName(target);
// the target is wiped, so refuse anything that isn't clearly a scratch database
if (targetDb === dbName(source) || !/-(dev|test)$/.test(targetDb)) {
  throw new Error(
    `refusing to seed "${targetDb}", it must end in -dev or -test`,
  );
}

const from = await mongoose.createConnection(source).asPromise();
const to = await mongoose.createConnection(target).asPromise();

async function copy(collection: string, filter: Record<string, unknown> = {}) {
  const docs = await from.collection(collection).find(filter).toArray();
  // drop rather than empty, so old indexes can't block the insert
  const existing = await to.db!.listCollections({ name: collection }).toArray();
  if (existing.length > 0) await to.dropCollection(collection);
  if (docs.length > 0) {
    await to.collection(collection).insertMany(docs);
  }
  console.log(`${collection}: copied ${docs.length}`);
}

// stand-ins for review authors, so dev matches production without personal data
async function addReviewAuthors() {
  const authorIds = await from.collection("reviews").distinct("userId");
  const authors = await from
    .collection("users")
    .find({
      _id: {
        $in: authorIds
          .filter((id) => mongoose.isValidObjectId(id))
          .map((id) => new mongoose.Types.ObjectId(id)),
      },
      email: { $ne: TEST_ACCOUNT_EMAIL },
    })
    .project({ _id: 1 })
    .toArray();
  const names = await from
    .collection("reviews")
    .aggregate([
      { $group: { _id: "$userId", name: { $first: "$reviewAuthor" } } },
    ])
    .toArray();
  const nameById = new Map(names.map((n) => [n._id, n.name]));
  if (authors.length > 0) {
    await to.collection("users").insertMany(
      authors.map(({ _id }) => ({
        _id,
        name: nameById.get(String(_id)) ?? "Reviewer",
        email: `reviewer-${_id}@example.invalid`,
        // not a valid bcrypt hash, so nobody can log in as a stand-in
        password: "!",
        cart: [],
      })),
    );
  }
  console.log(`users: added ${authors.length} review author stand-ins`);
}

try {
  await copy("products");
  await copy("reviews");
  // real users stay in production, only the shared test account is copied
  await copy("users", { email: TEST_ACCOUNT_EMAIL });
  await addReviewAuthors();
  // the app connects with autoIndex off, so indexes are built here
  // orders are never copied, they belong to real users
  for (const { modelName, schema } of [User, Product, Review, Order]) {
    const model = to.model(modelName, schema);
    await model.syncIndexes();
    const names = (await model.listIndexes()).map((i) => i.name).join(", ");
    console.log(`${model.collection.name} indexes: ${names}`);
  }
  console.log(`seeded ${targetDb} from ${dbName(source)}`);
} finally {
  await from.close();
  await to.close();
}
