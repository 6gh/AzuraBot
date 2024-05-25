import {
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import { Log } from "../classes/log.js";
import { ChannelType, Guild, VoiceBasedChannel } from "discord.js";
import { Vars, prisma } from "../index.js";
import { Assigns } from "@prisma/client";

export async function startPlayback(
  guild: Guild,
  channel: VoiceBasedChannel,
  audioUrl: string,
  assign: Assigns | null = null
) {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  });

  connection.on("stateChange", (_, newVoiceState) => {
    if (newVoiceState.status === VoiceConnectionStatus.Ready) {
      Log.debug("Connection is ready");

      if (channel?.type === ChannelType.GuildStageVoice) {
        if (guild.members.me?.voice.suppress) {
          Log.debug("Unsuppressing bot");
          guild.members.me?.voice.setSuppressed(false);
        }
      }
    }
  });

  const resource = createAudioResource(audioUrl, {
    inlineVolume: Vars.BOT_DEFAULT_VOLUME !== -1,
  });

  if (Vars.BOT_DEFAULT_VOLUME !== -1) {
    let volume = Vars.BOT_DEFAULT_VOLUME;
    if (assign) {
      volume = assign.volume ? assign.volume : Vars.BOT_DEFAULT_VOLUME;
    }

    Log.debug(`Setting volume to ${Vars.BOT_DEFAULT_VOLUME}`);

    resource.volume?.setVolume(Vars.BOT_DEFAULT_VOLUME);
  }

  const player = createAudioPlayer();
  connection.subscribe(player);
  player.play(resource);
}
