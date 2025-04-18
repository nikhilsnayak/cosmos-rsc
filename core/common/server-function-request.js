export class ServerFunctionRequest {
  constructor(context) {
    this.context = context;
  }

  get searchParams() {
    return this.context.searchParams;
  }
}
