export class ServerFunctionResponse {
  constructor(context) {
    this.context = context;
  }
  get status() {
    return this.context.status;
  }

  get json() {
    return this.context.json;
  }
}
