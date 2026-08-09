import crypto from "node:crypto";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "local-dev-secret-change-me";

const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const decode = (value) => JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

export const createId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function createAppUserId(existingIds = []) {
  let nextId = "";

  do {
    const numeric = Math.floor(100000 + Math.random() * 900000);
    nextId = `CALL-${numeric}`;
  } while (existingIds.includes(nextId));

  return nextId;
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password, passwordHash) {
  const [salt, originalKey] = passwordHash.split(":");
  if (!salt || !originalKey) {
    return false;
  }

  const candidateKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(originalKey, "hex"), Buffer.from(candidateKey, "hex"));
}

export function signToken(payload) {
  const body = encode({
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7
  });
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyToken(token) {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");
  if (expected !== signature) {
    return null;
  }

  const payload = decode(body);
  if (!payload.exp || payload.exp < Date.now()) {
    return null;
  }

  return payload;
}
