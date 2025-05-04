class IncorrectCredentialsError extends Error {
    constructor(message) {
      super(message);
    }
  }

  class UserNotFoundError extends Error {
    constructor(message) {
      super(message);
    }
  }
  
export { IncorrectCredentialsError, UserNotFoundError };
  