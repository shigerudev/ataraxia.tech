export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class SessionNotFoundError extends Error {
  constructor() {
    super('Session not found');
    this.name = 'SessionNotFoundError';
  }
}

export class UnauthorizedSessionError extends Error {
  constructor() {
    super('Session does not belong to the current user');
    this.name = 'UnauthorizedSessionError';
  }
}
