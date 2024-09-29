import * as mongoDB from "mongodb";
import * as dotenv from "ts-dotenv";
import { Doctor } from "../models/doctor";
import Fact from "../models/fact";
import Report from "../models/report";

export const env = dotenv.load({
  MONGODB: String,
  GCP_SERVICE_ACCOUNT: String,
  GCP_EMAIL: String,
  GCP_PRIVATE_KEY: String,
  GCP_ID: String,
  GCP_LOCATION: String,
  GCP_KEYRING: String,
  GCP_KEYNAME: String,
  GCP_BUCKET: String,
  KEY_ALIAS: String,
  KEYVAULT_NAMESPACE: String,
  USER_DB_NAME: String,
  PATIENT_COLLECTION: String,
  DOCTOR_COLLECTION: String,
  INTERACTION_DB_NAME: String,
  POST_COLLECTION: String,
  COMMENT_COLLECTION: String,
  REPORT_COLLECTION: String,
  FACT_COLLECTION: String,
  SERVER_PUBLIC: String,
  SERVER_PRIVATE: String,
  LIMITED_AUTH: String,
  TW_SID: String,
  TW_VSID: String,
  TW_TOKEN: String,
  VERIFY_NONE: String,
  VERIFY_URL: String,
  VERIFY_BODY_1: String,
  VERIFY_BODY_2: String,
});

export const collections: {
  patients: mongoDB.Collection;
  doctors: mongoDB.Collection<Doctor>;
  posts: mongoDB.Collection;
  // comments: mongoDB.Collection;
  reports: mongoDB.Collection<Report>;
  facts: mongoDB.Collection<Fact>;
} = {} as any;

export let encryption: mongoDB.ClientEncryption;
const masterKey = {
  projectId: env.GCP_ID,
  location: env.GCP_LOCATION,
  keyRing: env.GCP_KEYRING,
  keyName: env.GCP_KEYNAME,
};
export async function createKey(altName: string[]) {
  try {
    return await encryption.createDataKey("gcp", {
      masterKey,
      keyAltNames: altName ? altName : undefined,
    });
  } catch {
    return (await encryption.getKeyByAltName(altName[0]))?._id;
  }
}

export async function connectToDatabase() {
  const kmsProviders = {
    gcp: {
      email: env.GCP_EMAIL,
      privateKey: env.GCP_PRIVATE_KEY,
    },
  };
  const client = new mongoDB.MongoClient(env.MONGODB, {
    autoEncryption: {
      keyVaultNamespace: env.KEYVAULT_NAMESPACE,
      kmsProviders,
      bypassAutoEncryption: true,
      // bypassQueryAnalysis: true,
    },
  });
  await client.connect();
  encryption = new mongoDB.ClientEncryption(client, {
    keyVaultNamespace: env.KEYVAULT_NAMESPACE,
    kmsProviders,
  });
  await client
    .db(env.KEYVAULT_NAMESPACE.split(".")[0])
    .collection(env.KEYVAULT_NAMESPACE.split(".")[1])
    .createIndex(
      { keyAltNames: 1 },
      {
        unique: true,
        partialFilterExpression: { keyAltNames: { $exists: true } },
      },
    );

  try {
    const key = await encryption.createDataKey("gcp", {
      masterKey,
      keyAltNames: [env.KEY_ALIAS],
    });
    console.log(`New Key Created ${key} with alias ${env.KEY_ALIAS}`);
  } catch {}

  const userDB = client.db(env.USER_DB_NAME);
  const interactionDB = client.db(env.INTERACTION_DB_NAME);

  collections.patients = userDB.collection(env.PATIENT_COLLECTION);
  collections.doctors = userDB.collection(env.DOCTOR_COLLECTION);

  collections.posts = interactionDB.collection(env.POST_COLLECTION);
  // collections.comments = interactionDB.collection(env.COMMENT_COLLECTION);
  collections.reports = interactionDB.collection(env.REPORT_COLLECTION);
  collections.facts = interactionDB.collection(env.FACT_COLLECTION);

  console.log("Successfully connected to database!");
}
