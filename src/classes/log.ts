import chalkTemplate from "chalk-template";

export class Log {
  public static info(message: string) {
    console.log(chalkTemplate`{blue [INFO]} ${message}`);
  }

  public static error(message: unknown) {
    console.error(chalkTemplate`{bgRed [ERROR]} ${message}`);
  }

  public static warn(message: string) {
    console.warn(chalkTemplate`{bgYellow [WARN]} ${message}`);
  }

  public static debug(message: unknown) {
    if (process.env.NODE_ENV !== "development") return;
    console.debug(chalkTemplate`{bgMagenta [DEBUG]} ${message}`);
  }
}
