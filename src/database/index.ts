import {
  Connection,
  createConnection,
  getConnectionOptions,
  createConnections
} from 'typeorm';

export default async (host = "localhost"): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();

  const newOptions = Object.assign(defaultOptions, {
    host: process.env.NODE_ENV === "test" ? "localhost" : host,
    database:
      process.env.NODE_ENV === "test" ? "fin_api_test" : defaultOptions.database,
  });

  return await createConnection(newOptions);
};
