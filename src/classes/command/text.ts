import { Message } from "discord.js";
import AzuraBot from "../bot.js";

export class TextCommand {
  /**
   * The name of the command
   *
   * This is the name that the user will use to call the command
   * @example `~ping` would have a name of `ping`
   */
  public name: string;

  /**
   * The function to execute when the command is called
   * @param args The arguments passed to the command
   * @returns void or Promise<void>
   *
   * Arguments:
   * - message: The message object that triggered the command (Message object from discord.js)
   * - args: The arguments passed to the command (string[])
   * - bot: The bot instance (AzuraBot object from bot.js)
   */
  public execute: (args: TextCommandArguments) => void | Promise<void>;

  constructor(options: TextCommandOptions) {
    this.name = options.name;
    this.execute = options.execute;
  }
}

interface TextCommandOptions {
  name: string;
  execute: (args: TextCommandArguments) => void | Promise<void>;
}

interface TextCommandArguments {
  message: Message;
  args: string[];
  bot: AzuraBot;
}
