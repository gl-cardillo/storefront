// short enough to read out, still unique in practice
export const orderNumber = (id: string) => id.slice(-8).toUpperCase();
