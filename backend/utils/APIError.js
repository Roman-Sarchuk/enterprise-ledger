class APIError extends Error {
  constructor(code, detail, error = null) {
    const message = detail + (error ? `: ${error}` : '');
    super(message);

    this.code = code;
    this.detail = detail;
    this.error = error;

    this.name = 'APIError';
  }

  toJSON() {
    return {
      detail: this.detail,
      ...(this.error && { error: this.error })
    };
  }
}

module.exports = APIError;