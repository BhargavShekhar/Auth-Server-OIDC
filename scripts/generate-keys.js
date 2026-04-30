import { generateKeyPairSync } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const keysDir = path.resolve("keys");

if (!existsSync(keysDir)) {
    mkdirSync(keysDir, { recursive: true });
    console.log("Created keys/ directory");
}

const privateKeyPath = path.join(keysDir, "private.key");
const publicKeyPath = path.join(keysDir, "public.key");

if (existsSync(privateKeyPath) || existsSync(publicKeyPath)) {
    console.log("Keys already exist. Delete keys/ folder manually to regenerate.");
    process.exit(0);
}

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: {
        type: "pkcs8",
        format: "pem"
    },
    publicKeyEncoding: {
        type: "spki",
        format: "pem"
    }
});


writeFileSync(privateKeyPath, privateKey);
writeFileSync(publicKeyPath, publicKey);

console.log("RSA key pair generated successfully");
console.log(`  Private key → keys/private.key`);
console.log(`  Public key  → keys/public.key`);