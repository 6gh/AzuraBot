import { ChannelType, EmbedBuilder, Guild, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../../classes/command/slash.js";
import { azuraClient, prisma } from "../../../index.js";
import { Log } from "../../../classes/log.js";

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
    )
    .addSubcommand(subCommand => 
      subCommand
        .setName("pause")
        .setDescription("Pauses the radio from playing here, and prevents auto-joining until resumed")
    )
    .addSubcommand(subCommand => 
      subCommand
        .setName("resume")
        .setDescription("Resumes auto-joining and playback of the radio selected")
    )
    .addSubcommand(subCommand => 
      subCommand
        .setName("standby")
        .setDescription("Get or set the standby mode. If enabled, when someone goes on stage the bot will automatically pause")
        .addBooleanOption(option => 
          option
          .setName("value")
          .setDescription("Set the value of standby mode. Leave blank to get the selected mode")
          .setRequired(false)
        )
    )
    .addSubcommand(subCommand => 
      subCommand
        .setName("updates")
        .setDescription("Set what channel to send now playing updates to")
        .addChannelOption(option => 
          option.setName("channel")
          .setDescription("The text channel to send updates to")
          .addChannelTypes([
            ChannelType.GuildText,
            ChannelType.GuildStageVoice,
            ChannelType.GuildVoice,
            ChannelType.PublicThread,
            ChannelType.PrivateThread,
          ])
          .setRequired(true)
        )
    )
    .addSubcommand(subCommand => 
      subCommand
        .setName("quality")
        .setDescription("Get or select what mount point quality to play for the radio selected")
        .addNumberOption(option =>
          option
            .setName("mount")
            .setDescription("The mount ID of the quality you wish to select.")
            .setRequired(false)
        )
    ),
  async ({ interaction }) => {
    if (!interaction.guildId) return;

    switch (interaction.options.getSubcommand()) {
      case "list":
        await interaction.deferReply();

        const stations = await azuraClient.Stations.getAll();

        Log.debug(stations);

        const embed = new EmbedBuilder()
          .setTitle("Stations Available")
          .setDescription(`There are ${stations.length} stations available`)
          .addFields(stations.map(station => {
            return {
              name: `**Station ID:** ${station.id}`,
              value: `**${station.name}** - ${station.description || "*No description*"}`
            }
          }));

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

      case "pause":
        await interaction.deferReply();

        const assigned = await prisma.assigns.findFirst({
          where: {
            guildId: interaction.guildId
          }
        });

        if (!assigned) {
          await interaction.editReply({ content: ":x: You haven't assigned a radio in this server! Please assign one with /station assign" })
          break;
        }

        await prisma.assigns.update({
          where: {
            guildId: interaction.guildId
          },
          data: {
            paused: true,
          }
        })

        await interaction.editReply({ content: ":pause_button: Radio paused, and auto-joining disabled. Resume with /station resume" })
        break;

      case "resume":
        await interaction.deferReply();

        const assign = await prisma.assigns.findFirst({
          where: {
            guildId: interaction.guildId
          }
        })

        if (!assign) {
          await interaction.editReply({ content: ":x: You haven't assigned a radio in this server! Please assign one with /station assign" })
          break;
        }

        await prisma.assigns.update({
          where: {
            guildId: interaction.guildId
          },
          data: {
            paused: false,
          }
        })

        await interaction.editReply({ content: ":arrow_forward: Radio resumed, and auto-joining enabled. Pause with /station pause" })
        break;

      default:
        break;
    }
  }
);
