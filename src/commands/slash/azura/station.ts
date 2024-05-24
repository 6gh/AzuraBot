import { ChannelType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../../classes/command/slash.js";
import { azuraClient, prisma } from "../../../index.js";

export default new SlashCommand(
  new SlashCommandBuilder()
    .setName("station")
    .setDescription("Get the various station commands")
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("List all stations")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("assign")
        .setDescription("Assign a station to a VC")
        .addIntegerOption((option) =>
          option
            .setName("station")
            .setDescription("The station's ID to set")
            .setMinValue(0)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("vc")
            .setDescription("The voice channel to assign the station to")
            .setRequired(true)
            .addChannelTypes([
              ChannelType.GuildVoice,
              ChannelType.GuildStageVoice,
            ])
        )
    ),
  async ({ interaction }) => {
    if (!interaction.guildId) return;

    switch (interaction.options.getSubcommand()) {
      case "list":
        await interaction.deferReply();

        const stations = await azuraClient.Stations.getAll();

        const embed = new EmbedBuilder()
          .setTitle("Stations Available")
          .setDescription(`There are ${stations.length} stations available`)
          .addFields([
            {
              name: "Stations",
              value: stations
                .map((station) => `${station.name}: \`${station.id}\``)
                .join("\n"),
            },
          ]);

        await interaction.editReply({ embeds: [embed] });
        break;

      case "assign":
        await interaction.deferReply();

        const stationId = interaction.options.getInteger("station");
        const vc = interaction.options.getChannel("vc");

        if (!stationId || !vc) {
          await interaction.editReply("Invalid station or voice channel");
          return;
        }

        if (
          vc.type !== ChannelType.GuildVoice &&
          vc.type !== ChannelType.GuildStageVoice
        ) {
          await interaction.editReply("Invalid voice channel type");
          return;
        }

        const station = await azuraClient.Stations.get(stationId);

        await prisma.assigns.upsert({
          where: { guildId: interaction.guildId },
          create: {
            channelId: vc.id,
            guildId: interaction.guildId,
            radioStation: stationId,
          },
          update: {
            channelId: vc.id,
            radioStation: stationId,
          },
        });

        await interaction.editReply(
          `Assigned station **${station.name}** to ${vc.name} in this server.`
        );
        break;
      default:
        break;
    }
  }
);
