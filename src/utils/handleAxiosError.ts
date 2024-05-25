import { AxiosError, isAxiosError } from "axios";
import { Log } from "../classes/log.js";

export function HandleAxiosError(error: unknown | Error | AxiosError): string {
  let message = "[ERROR] Failed to reach AzuraCast API.";
  if (error instanceof Error) {
    return error.message;
  } else if (isAxiosError(error)) {
    if (!error.response) {
      message += "An unknown error occurred.";
    } else {
      switch (error.response.status) {
        case 404:
          message += "Check your API URL.";
          break;
        case 403:
          message += "Check your API Key.";
          break;
        case 500:
          message += "Server error, please try again later.";
          break;
        default:
          message += "An unknown error occurred.";
          break;
      }
    }
  } else {
    message += "An unknown error occurred.";
  }
  Log.error(message);
  Log.error(error);

  return message;
}
