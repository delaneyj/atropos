import PersistenceAdaptor from './persistence/adapter';
import serializer, { Serializer } from './serializer';
import Loki from './persistence/loki';

// interface Configuration {
//     cacheExpiration: number;
//     cacheDeleteCheckInterval: number;
//     repository: PersistenceAdaptor;
//     snapshotEvery: number;
//     payloadSerializationFormat: Serializer
// }

// const configuration = {
//     cacheExpiration: 0,
//     cacheDeleteCheckInterval: 60,
//     repository: new Loki(),
//     snapshotEvery: 0,
//     payloadSerializationFormat: serializer.stringify
// }
// export default configuration;

