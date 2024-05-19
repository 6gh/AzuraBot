import { ClientEvents } from "discord.js";

export class BotEvent<K extends keyof ClientEvents> {
  /**
   * The event to listen for
   * @see https://discord.js.org/docs/packages/discord.js/14.15.2/Client:Class#applicationCommandPermissionsUpdate
   */
  public event: K;

  /**
   * The function to execute when the event is triggered
   *
   * This also has the same arguments as the ClientEvent
   * @see https://discord.js.org/docs/packages/discord.js/14.15.2/ClientEvents:Interface
   */
  public execute: (...args: ClientEvents[K]) => void | Promise<void>;

  constructor(
    e: K,
    execute: (...args: ClientEvents[K]) => void | Promise<void>
  ) {
    this.event = e;
    this.execute = execute;
  }
}
