export class Logger {
  static log(
    message: string,
    level: "DEBUG" | "INFO" | "WARN" | "ERROR" = "INFO"
  ) {
    const timestamp = new Date().toISOString(); // Format: YYYY-MM-DDTHH:mm:ss.sssZ
    let color;

    switch (level) {
      case "INFO":
        color = "\x1b[32m"; // Green
        break;
      case "DEBUG":
        color = "\x1b[30m"; // ?
        break;
      case "WARN":
        color = "\x1b[33m"; // Yellow
        break;
      case "ERROR":
        color = "\x1b[31m"; // Red
        break;
    }

    console.log(`${color}[${timestamp}] [${level}] ${message}\x1b[0m`);
  }

  static info(message: string) {
    this.log(message, "INFO");
  }

  static warn(message: string) {
    this.log(message, "WARN");
  }

  static error(message: string) {
    this.log(message, "ERROR");
  }

  static debug(message: string) {
    this.log(message, "DEBUG");
  }
}
