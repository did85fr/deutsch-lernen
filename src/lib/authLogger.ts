type LogEntry = {
  timestamp: string;
  message: string;
  data?: any;
};

class AuthLogger {
  private logs: LogEntry[] = [];

  log(message: string, data?: any) {
    if (!import.meta.env.DEV) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      message,
      data
    };

    this.logs.push(entry);
    console.log(`[Auth Debug] ${message}`, data);
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clearLogs() {
    this.logs = [];
  }
}

export const authLogger = new AuthLogger();

