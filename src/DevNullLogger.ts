import { ILogger } from "./ILogger";

export default class DevNullLogger implements ILogger {
  public log(message?: any, ...optionalParams: any[]): void {
    return;
  }

  public info(message?: any, ...optionalParams: any[]): void {
    this.log(message, optionalParams);
  }

  public warn(message?: any, ...optionalParams: any[]): void {
    this.log(message, optionalParams);
  }

  public error(message?: any, ...optionalParams: any[]): void {
    this.log(message, optionalParams);
  }
}
