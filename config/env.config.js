export const getRuntimeEnv = () => {
  const nodeEnv = (process.env.NODE_ENV || "").trim().toLowerCase();
  return nodeEnv === "production" ? "PROD" : "DEV";
};

export const getEnvValue = (baseKey, fallback = "") => {
  const scopedKey = `${baseKey}_${getRuntimeEnv()}`;
  const scopedValue = process.env[scopedKey];

  if (typeof scopedValue === "string" && scopedValue.trim() !== "") {
    return scopedValue.trim();
  }

  const directValue = process.env[baseKey];
  if (typeof directValue === "string" && directValue.trim() !== "") {
    return directValue.trim();
  }

  return fallback;
};

export const isProduction = () => getRuntimeEnv() === "PROD";
