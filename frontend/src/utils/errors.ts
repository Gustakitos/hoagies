export const getErrorMessage = (error: unknown): string | string[] => {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    if (
      'response' in error &&
      (error as any).response &&
      typeof (error as any).response === 'object' &&
      'data' in (error as any).response &&
      (error as any).response.data &&
      typeof (error as any).response.data === 'object' &&
      'message' in (error as any).response.data
    ) {
      return (error as any).response.data.message;
    }

    if ('message' in error && typeof (error as any).message === 'string') {
      return (error as any).message;
    }
  }

  return 'An unexpected error occurred';
};

