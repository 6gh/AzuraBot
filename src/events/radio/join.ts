import axios from "axios";
import { BotEvent } from "../../classes/event.js";
import { Vars, azuraClient, prisma } from "../../index.js";
import {
  joinVoiceChannel,
  createAudioResource,
  createAudioPlayer,
} from "@discordjs/voice";
import { HandleAxiosError } from "../../utils/handleAxiosError.js";

export default new BotEvent("voiceStateUpdate", async (oldState, newState) => {
  if (oldState.channelId === null && newState.channelId !== null) {
    console.log(newState.channelId);

    const entry = await prisma.channel.findFirst({
      where: {
        id: newState.channelId,
      },
    });

    console.log(entry);

    if (entry) {
      console.log(
        `User ${newState.member?.user.tag} joined channel ${entry.id}`
      );

      try {
        const station = await azuraClient.Stations.get(2)

        const connection = joinVoiceChannel({
          channelId: newState.channelId,
          guildId: newState.guild.id,
          adapterCreator: newState.guild.voiceAdapterCreator,
        });

        const resource = createAudioResource(station.listen_url);

        const player = createAudioPlayer();
        connection.subscribe(player);
        player.play(resource);

        console.log(`Playing ${station.name} on ${entry.id}`);
      } catch (error: unknown) {
        HandleAxiosError(error);
      }
    }
  }
});
