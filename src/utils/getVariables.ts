export function _GetVariables(): Variables {
  if (!process.env.AZURACAST_API_URL)
    throw new Error("AZURACAST_API_URL is defined");
  if (!process.env.AZURACAST_API_KEY)
    throw new Error("AZURACAST_API_KEY is not defined");

  if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN is not defined");
  if (!process.env.BOT_DATABASE_URL)
    throw new Error("BOT_DATABASE_URL is not defined");

  const ownerID = process.env.BOT_OWNER_ID;
  const prefix = process.env.BOT_PREFIX || "~";
  const defaultVolume = process.env.BOT_DEFAULT_VOLUME
    ? !Number.isNaN(Number.parseFloat(process.env.BOT_DEFAULT_VOLUME))
      ? Number.parseFloat(process.env.BOT_DEFAULT_VOLUME) || -1
      : -1
    : -1;

  if (defaultVolume !== -1 && (defaultVolume < 0 || defaultVolume > 1)) {
    throw new Error("BOT_DEFAULT_VOLUME must be between 0 and 1, or -1");
  }

  return {
    AZURACAST_API_URL: process.env.AZURACAST_API_URL,
    AZURACAST_API_KEY: process.env.AZURACAST_API_KEY,

    BOT_TOKEN: process.env.BOT_TOKEN,
    BOT_OWNER_ID: ownerID,
    BOT_PREFIX: prefix,
    BOT_DEFAULT_VOLUME: defaultVolume,
  };
}

interface Variables {
  AZURACAST_API_URL: string;
  AZURACAST_API_KEY: string;

  BOT_TOKEN: string;
  BOT_OWNER_ID: string | undefined;
  BOT_PREFIX: string;
  BOT_DEFAULT_VOLUME: number;
}
