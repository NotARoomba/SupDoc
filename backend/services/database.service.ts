import * as mongoDB from "mongodb";
import * as dotenv from "ts-dotenv";

const env = dotenv.load({
  MONGODB: String,
  GCP_EMAIL: String,
  GCP_PRIVATE_KEY: String,
  GCP_ID: String,
  GCP_LOCATION: String,
  GCP_KEYRING: String,
  GCP_KEYNAME: String,
  KEY_ALIASES: String,
  KEYVAULT_NAMESPACE: String,
  USER_DB_NAME: String,
  PATIENT_COLLECTION: String,
  DOCTOR_COLLECTION: String,
});

export const collections: {
  patients?: mongoDB.Collection;
  doctors?: mongoDB.Collection;
} = {};

export let encryption: mongoDB.ClientEncryption;

export async function connectToDatabase() {
  const keyAliases = env.KEY_ALIASES.split(",");
  const kmsProviders = {
    gcp: {
      email: env.GCP_EMAIL,
      privateKey: env.GCP_PRIVATE_KEY,
    },
  };

  const masterKey = {
    projectId: env.GCP_ID,
    location: env.GCP_LOCATION,
    keyRing: env.GCP_KEYRING,
    keyName: env.GCP_KEYNAME,
  };
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(env.MONGODB, {
    autoEncryption: {
      keyVaultNamespace: env.KEYVAULT_NAMESPACE,
      kmsProviders,
      bypassAutoEncryption: true,
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
  for (const alias of keyAliases) {
    try {
      const key = await encryption.createDataKey("gcp", {
        masterKey,
        keyAltNames: [alias],
      });
      console.log(`New Key Created ${key} with alias ${alias}`);
    } catch {}
  }
  // need to encrypt certain types of data to go to mongodb
  const userDB: mongoDB.Db = client.db(env.USER_DB_NAME);
  const patientsCollection: mongoDB.Collection = userDB.collection(
    env.PATIENT_COLLECTION,
  );
  collections.patients = patientsCollection;
  const doctorsCollection: mongoDB.Collection = userDB.collection(
    env.PATIENT_COLLECTION,
  );
  collections.doctors = doctorsCollection;

  console.log("Successfully connected to database!");
}
