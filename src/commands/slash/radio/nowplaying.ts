import { APIEmbedField, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../../classes/command/slash.js";
import { azuraClient, prisma } from "../../../index.js";
import { formatProgress, formatTime } from "../../../utils/formatTime.js";

export default new SlashCommand(
  new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Get the currently playing song"),
  async ({ interaction }) => {
    if (!interaction.guildId) {
      return;
    }

    await interaction.deferReply();

    const entry = await prisma.assigns.findFirst({
      where: {
        guildId: interaction.guildId,
      },
    });

    if (!entry) {
      await interaction.editReply({
        content: ":x: No radio station assigned to this server",
      });
      return;
    }

    const now_playing = await azuraClient.NowPlaying.get(entry.radioStation);

    const fields: APIEmbedField[] = [];

    if (now_playing.now_playing?.song?.album) {
      fields.push({
        name: "Album",
        value: now_playing.now_playing?.song?.album,
        inline: true,
      });
    }

    if (now_playing.now_playing?.song?.genre) {
      fields.push({
        name: "Genre",
        value: now_playing.now_playing?.song?.genre,
        inline: true,
      });
    }

    // TODO: Implement custom fields
    // now_playing.now_playing?.song?.custom_fields?.forEach((field) => {
    //     const [key, value] = field.split(":");
    //     fields.push({
    //         name: key,
    //         value,
    //         inline: true,
    //     });
    // });

    await interaction.editReply({
      content: entry.paused
        ? ":pause_button: **Playback paused**"
        : `:musical_note: **Now playing**`,
      embeds: [
        now_playing.is_online
          ? new EmbedBuilder()
              .setTitle(
                `${
                  now_playing.now_playing?.song?.artist || "Unknown Artist"
                } ~ ${now_playing.now_playing?.song?.title || "Unknown Title"}`
              )
              .setThumbnail(
                now_playing.now_playing?.song?.art as unknown as string
              )
              // ▶ 🔘▬▬▬▬▬▬▬▬▬▬▬ [00:10/03:15] 🔊
              .setDescription(
                `▶ ${formatProgress(
                  now_playing.now_playing?.elapsed,
                  now_playing.now_playing?.duration
                )} [${formatTime(
                  now_playing.now_playing?.elapsed
                )} / ${formatTime(now_playing.now_playing?.duration)}] 🔊`
              )
              .addFields(fields)
          : new EmbedBuilder()
              .setTitle("Station Offline")
              .setDescription(
                "The station is currently offline. Please try again later."
              ),
      ],
    });
  }
);
