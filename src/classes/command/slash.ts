import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import AzuraBot from "../bot.js";

export class SlashCommand {
  public meta: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  public execute: (args: SlashCommandArguments) => void | Promise<void>;

  constructor(
    meta: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder,
    execute: (args: SlashCommandArguments) => void | Promise<void>
  ) {
    this.meta = meta;
    this.execute = execute;
  }
}

interface SlashCommandArguments {
  interaction: ChatInputCommandInteraction;
  bot: AzuraBot;
}
