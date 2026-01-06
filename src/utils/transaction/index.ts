import { IsolationLevel, EntityManager } from '@mikro-orm/core';

export type ITransactionWrapper = <T>(
  work: () => Promise<T>,
  isolationLevel?: IsolationLevel,
) => Promise<T>;

export function transactionWrapperFactory(em: EntityManager) {
  return async function <T>(
    work: () => Promise<T>,
    isolationLevel: IsolationLevel = IsolationLevel.SERIALIZABLE,
  ): Promise<T> {
    await em.begin({ isolationLevel });
    try {
      const result = await work();
      await em.commit();
      return result;
    } catch (error) {
      console.error('Transaction failed, rolling back', error);
      await em.rollback();
      throw error;
    }
  };
}
