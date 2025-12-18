export const normalizeUri = (uri: string) => {
  const trimmed = uri.trim();
  if (trimmed === '') {
    return '';
  }
  const normalized = trimmed.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\/+/g, '/');
  return '/' + normalized;
};
