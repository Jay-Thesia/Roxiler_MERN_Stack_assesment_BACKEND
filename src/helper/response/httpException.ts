

export class HttpException extends Error {
  public status: number;
  public message: string;
  public toast: boolean;
  public data: any | {};

  constructor(status: number, message: any, data?: any, toast = true) {
    super(message);
    this.data = data;
    this.status = status || 400;
    this.message = message;
    this.toast = toast;
  }
}
