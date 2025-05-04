const errorHandlers = {
  IncorrectCredentialsError: (res) => {
    res.status(401).json({ error: 'error_messages.incorrect_credentials' });
  },
  UserNotFoundError: (res) => {
    res.status(404).json({ error: 'error_messages.user_not_found' });
  },
  InternalServerError: (res) => {
    res.status(500).json({ error: 'error_messages.internal_error' });
  },
  MongoServerError: (res) => {
    res.status(500).json({ error: 'error_messages.duplicate_user' });
  },
};

export default errorHandlers;