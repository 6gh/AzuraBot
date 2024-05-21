export function _GetVariables(): Variables {
  if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN is not defined");
  if (!process.env.BOT_OWNER_ID) throw new Error("BOT_OWNER_ID is not defined");
  if (!process.env.AZURACAST_API_URL)
    throw new Error("AZURACAST_API_URL is defined");
  if (!process.env.AZURACAST_API_KEY)
    throw new Error("AZURACAST_API_KEY is not defined");

  const prefix = process.env.BOT_PREFIX || "~";
  const ownerID: string | undefined = process.env.BOT_OWNER_ID;

  return {
    BOT_TOKEN: process.env.BOT_TOKEN,
    BOT_PREFIX: prefix,
    BOT_OWNER_ID: ownerID,

    AZURACAST_API_URL: process.env.AZURACAST_API_URL,
    AZURACAST_API_KEY: process.env.AZURACAST_API_KEY,
  };
}

interface Variables {
  BOT_TOKEN: string;
  BOT_PREFIX: string;
  BOT_OWNER_ID: string | undefined;

  AZURACAST_API_URL: string;
  AZURACAST_API_KEY: string;
}
