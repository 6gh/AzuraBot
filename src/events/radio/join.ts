import { BotEvent } from "../../classes/event.js";
import { azuraClient, prisma } from "../../index.js";
import { getVoiceConnection } from "@discordjs/voice";
import { Log } from "../../classes/log.js";
import { startPlayback } from "../../utils/startPlayback.js";

export default new BotEvent("voiceStateUpdate", async (oldState, newState) => {
  if (newState.member?.user.bot) {
    return;
  }

  if (newState.channelId !== null && newState.channel !== null) {
    Log.debug(`voiceStateUpdate called; member joined: ${newState.channelId}`);

    const entry = await prisma.assigns.findFirst({
      where: {
        channelId: newState.channelId,
        guildId: newState.guild.id,
      },
    });

    Log.debug(entry);

    if (entry) {
      Log.info(
        `User ${newState.member?.user.tag} joined channel ${entry.channelId}`
      );

      if (entry.paused) {
        Log.info(`Channel ${entry.channelId} is paused`);
        return;
      }

      try {
        const station = await azuraClient.Stations.get(2);

        const selectedAudio =
          station.mounts.find((mount) => {
            if (entry.mountSelected === -1) {
              return mount.is_default;
            } else {
              return mount.id === entry.mountSelected;
            }
          })?.url || station.listen_url;

        Log.debug(selectedAudio);

        startPlayback(newState.guild, newState.channel, selectedAudio);

        Log.info(`Playing ${station.name} on ${entry.channelId}`);
      } catch (error: unknown) {
        Log.error(error);
      }
    }
  }
  if (oldState.channelId && newState.channelId === null) {
    Log.debug(`voiceStateUpdate called; member left: ${oldState.channelId}`);

    const assign = await prisma.assigns.findFirst({
      where: {
        channelId: oldState.channelId,
        guildId: oldState.guild.id,
      },
    });

    if (!assign) {
      return;
    }

    if (oldState.channelId !== assign.channelId) {
      return;
    }

    const connection = getVoiceConnection(oldState.guild.id);

    if (connection) {
      Log.info(
        `User ${oldState.member?.user.tag} left channel ${oldState.channelId}`
      );

      connection.destroy();

      Log.info(`Stopped playing on ${oldState.channelId}`);
    }
  }
});
