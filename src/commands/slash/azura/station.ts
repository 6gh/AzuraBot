import { ChannelType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../../classes/command/slash.js";
import { azuraClient, prisma } from "../../../index.js";
import { Log } from "../../../classes/log.js";
import { getVoiceConnection } from "@discordjs/voice";
import { startPlayback } from "../../../utils/startPlayback.js";

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
    .addSubcommand((subCommand) =>
      subCommand
        .setName("pause")
        .setDescription(
          "Pauses the radio from playing here, and prevents auto-joining until resumed"
        )
    )
    .addSubcommand((subCommand) =>
      subCommand
        .setName("resume")
        .setDescription(
          "Resumes auto-joining and playback of the radio selected"
        )
    )
    .addSubcommandGroup((subCommandGroup) =>
      subCommandGroup
        .setName("quality")
        .setDescription("Get or select mount points from the radio selected")
        .addSubcommand((subCommand) =>
          subCommand
            .setName("list")
            .setDescription("List all mount points available")
        )
        .addSubcommand((subCommand) =>
          subCommand
            .setName("select")
            .setDescription("Select a mount point to use")
            .addIntegerOption((option) =>
              option
                .setName("mount")
                .setDescription("The mount point to select")
                .setRequired(true)
            )
        )
    ),
  async ({ interaction }) => {
    if (!interaction.guildId) return;
    if (!interaction.guild) return;

    switch (interaction.options.getSubcommandGroup()) {
      case "quality":
        switch (interaction.options.getSubcommand()) {
          case "list":
            await interaction.deferReply();

            const assigned = await prisma.assigns.findFirst({
              where: {
                guildId: interaction.guildId,
              },
            });

            if (!assigned) {
              await interaction.reply(
                ":x: You haven't assigned a radio in this server! Please assign one with /station assign"
              );
              return;
            }

            const station = await azuraClient.Stations.get(
              assigned.radioStation
            );

            const embed = new EmbedBuilder()
              .setTitle(`Mount Points for ${station.name}`)
              .setDescription(
                `There are ${station.mounts.length} mount points available`
              )
              .addFields(
                station.mounts.map((mount) => {
                  const selected =
                    assigned.mountSelected === -1
                      ? mount.is_default
                      : mount.id === assigned.mountSelected;

                  return {
                    name: `Mount ID: ${mount.id} ${
                      mount.is_default ? "**[DEFAULT]**" : ""
                    } ${selected ? "**<SELECTED>**" : ""}`,
                    value: `Name: **${mount.name}**
                      Bitrate: ${mount.bitrate} Kbps
                      Format: ${mount.format}
                      URL: [Listen](${mount.url})`,
                  };
                })
              );

            await interaction.editReply({ embeds: [embed] });
            break;

          case "select":
            await interaction.deferReply();

            const mountId = interaction.options.getInteger("mount");
            if (!mountId) {
              await interaction.editReply(":x: Invalid mount point");
              return;
            }

            const assign = await prisma.assigns.findFirst({
              where: {
                guildId: interaction.guildId,
              },
            });

            if (!assign) {
              await interaction.editReply(
                ":x: You haven't assigned a radio in this server! Please assign one with /station assign"
              );
              return;
            }

            const assigned_ = await azuraClient.Stations.get(
              assign.radioStation
            );

            const mount = assigned_.mounts.find((m) => m.id === mountId);
            if (!mount) {
              await interaction.editReply(":x: Invalid mount point");
              return;
            }

            await prisma.assigns.update({
              where: {
                guildId: interaction.guildId,
              },
              data: {
                mountSelected: mountId,
              },
            });

            await interaction.editReply(
              `:white_check_mark: Selected mount point **${mount.name}** for **${assigned_.name}**`
            );
            break;

          default:
            await interaction.reply(":x: Invalid subcommand");
            break;
        }
        break;

      default:
        switch (interaction.options.getSubcommand()) {
          case "list":
            await interaction.deferReply();

            const stations = await azuraClient.Stations.getAll();

            Log.debug(stations);

            const embed = new EmbedBuilder()
              .setTitle("Stations Available")
              .setDescription(`There are ${stations.length} stations available`)
              .addFields(
                stations.map((station) => {
                  return {
                    name: `**Station ID:** ${station.id}`,
                    value: `**${station.name}** - ${
                      station.description || "*No description*"
                    }`,
                  };
                })
              );

            await interaction.editReply({ embeds: [embed] });
            break;

          case "assign":
            await interaction.deferReply();

            const stationId = interaction.options.getInteger("station");
            const vc = interaction.options.getChannel("vc");

            if (!stationId || !vc) {
              await interaction.editReply(":x: Invalid station or voice channel");
              return;
            }

            if (
              vc.type !== ChannelType.GuildVoice &&
              vc.type !== ChannelType.GuildStageVoice
            ) {
              await interaction.editReply(":x: Invalid voice channel type");
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
              `:white_check_mark: Assigned station **${station.name}** to ${vc.name} in this server.`
            );
            break;

          case "pause":
            await interaction.deferReply();

            const assigned = await prisma.assigns.findFirst({
              where: {
                guildId: interaction.guildId,
              },
            });

            if (!assigned) {
              await interaction.editReply({
                content:
                  ":x: You haven't assigned a radio in this server! Please assign one with /station assign",
              });
              break;
            }

            const connection = getVoiceConnection(assigned.guildId);

            if (connection) {
              Log.info(
                `Stopping playback on ${assigned.channelId} due to pause command`
              );

              connection.destroy();
            }

            await prisma.assigns.update({
              where: {
                guildId: interaction.guildId,
              },
              data: {
                paused: true,
              },
            });

            await interaction.editReply({
              content:
                ":pause_button: Radio paused, and auto-joining disabled. Resume with /station resume",
            });
            break;

          case "resume":
            await interaction.deferReply();

            const assign = await prisma.assigns.findFirst({
              where: {
                guildId: interaction.guildId,
              },
            });

            if (!assign) {
              await interaction.editReply({
                content:
                  ":x: You haven't assigned a radio in this server! Please assign one with /station assign",
              });
              break;
            }

            const channel = await interaction.guild?.channels.fetch(
              assign.channelId
            );

            const station_ = await azuraClient.Stations.get(
              assign.radioStation
            );

            const audioUrl =
              station_.mounts.find((mount) => {
                if (assign.mountSelected === -1) {
                  return mount.is_default;
                } else {
                  return mount.id === assign.mountSelected;
                }
              })?.url || station_.listen_url;

            if (channel) {
              if (channel.isVoiceBased() && channel.members.size > 0) {
                Log.info("Resuming radio playback due to resume command");
                startPlayback(interaction.guild, channel, audioUrl);
              }
            }

            await prisma.assigns.update({
              where: {
                guildId: interaction.guildId,
              },
              data: {
                paused: false,
              },
            });

            await interaction.editReply({
              content:
                ":arrow_forward: Radio resumed, and auto-joining enabled. Pause with /station pause",
            });
            break;

          default:
            console.log();
            await interaction.reply(":skull: Invalid subcommand");
            break;
        }
        break;
    }
  }
);
