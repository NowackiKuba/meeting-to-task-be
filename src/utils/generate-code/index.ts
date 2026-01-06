export const generateCode = (length: number, onlyNumbers = false) => {
  if (length <= 0) {
    throw new Error('Length must be greater than 0');
  }

  const chars = onlyNumbers
    ? '123456789'
    : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

