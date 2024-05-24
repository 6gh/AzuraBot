import axios from "axios";
import { BotEvent } from "../../classes/event.js";
import { Vars, azuraClient, prisma } from "../../index.js";
import {
  joinVoiceChannel,
  createAudioResource,
  createAudioPlayer,
  getVoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { HandleAxiosError } from "../../utils/handleAxiosError.js";
import { ChannelType } from "discord.js";
import { Log } from "../../classes/log.js";

export default new BotEvent("voiceStateUpdate", async (oldState, newState) => {
  if (newState.member?.user.bot) return;

  if (newState.channelId !== null) {
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

      try {
        const station = await azuraClient.Stations.get(2);

        const bestAudio =
          station.mounts.length > 1
            ? station.mounts.sort(
                (x, y) => (y.bitrate || -1) - (x.bitrate || -1)
              )[0].url
            : station.mounts[0].url;

        Log.debug(bestAudio);

        const connection = joinVoiceChannel({
          channelId: newState.channelId,
          guildId: newState.guild.id,
          adapterCreator: newState.guild.voiceAdapterCreator,
        });

        connection.on("stateChange", (_, newVoiceState) => {
          if (newVoiceState.status === VoiceConnectionStatus.Ready) {
            Log.debug("Connection is ready");

            if (newState.channel?.type === ChannelType.GuildStageVoice) {
              if (newState.guild.members.me?.voice.suppress) {
                Log.debug("Unsuppressing bot");
                newState.guild.members.me?.voice.setSuppressed(false);
              }
            }
          }
        });

        const resource = createAudioResource(station.listen_url);

        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);

        Log.info(`Playing ${station.name} on ${entry.channelId}`);
      } catch (error: unknown) {
        HandleAxiosError(error);
      }
    }
  }
  if (oldState.channelId && newState.channelId === null) {
    Log.debug(oldState.channelId);

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
