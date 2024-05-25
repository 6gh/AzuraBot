import { BotEvent } from "../classes/event.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, { AxiosError } from "axios";
import { Vars, azuraClient, prisma } from "../index.js";
import { ActivityType } from "discord.js";
import { HandleAxiosError } from "../utils/handleAxiosError.js";
import { Log } from "../classes/log.js";
import { startPlayback } from "../utils/startPlayback.js";

export default new BotEvent("ready", async (client) => {
  Log.info(`Logged in as ${client.user?.tag}`);

  let reachable = false;
  // check if the azuracast api is reachable
  // if it is, set the status to the instance name
  // if it isn't, set the status to "Playing ~help"
  try {
    const response = await axios.get(
      `${Vars.AZURACAST_API_URL}/api/admin/settings`,
      {
        headers: {
          "X-API-Key": Vars.AZURACAST_API_KEY,
        },
      }
    );

    Log.info(`Connected to ${response.data.instance_name} API`);

    client.user?.setPresence({
      activities: [
        {
          name: response.data.instance_name || "~help",
          type: ActivityType.Listening,
        },
      ],
    });

    reachable = true;
  } catch (error: AxiosError | unknown) {
    HandleAxiosError(error);

    client.user?.setPresence({
      activities: [
        {
          name: "~help",
          type: ActivityType.Listening,
        },
      ],
    });
  }

  if (reachable) {
    Log.info("Auto-joining voice channels...");
    const assigns = await prisma.assigns.findMany({
      where: {
        paused: false,
      },
    });

    assigns.forEach(async (assign) => {
      const channel = await client.channels.fetch(assign.channelId);

      if (!channel) {
        Log.warn(
          `Channel ${assign.channelId} from entry ${assign.guildId} not found`
        );
        return;
      }

      if (
        channel.isVoiceBased() &&
        channel.members.filter((member) => !member.user.bot).size > 0
      ) {
        const station = await azuraClient.Stations.get(assign.radioStation);

        const selectedAudio =
          station.mounts.find((mount) => {
            if (assign.mountSelected === -1) {
              return mount.is_default;
            } else {
              return mount.id === assign.mountSelected;
            }
          })?.url || station.listen_url;

        Log.debug(selectedAudio);

        startPlayback(channel.guild, channel, selectedAudio);

        Log.info(`Playing ${station.name} on ${channel.id}`);
      }
    });

    Log.info("Auto-join complete");
  }
});
