export const notFound = (c: DomainContext) => {
  return c.json({ message: 'Rota não encontrada' }, 404);
};
