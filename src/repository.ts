import PersistenceAdaptor from './persistence/adapter';
import { Aggregate, EventMetadata } from './aggregate';
import hook from './hook';
import { Serializer } from './serializer';
import cache from './cache';

//http://stackoverflow.com/questions/34542489/get-constructor-instance-from-generic-type-in-typescript
interface ParameterlessConstructor<T> {
    new (): T;
}

class Creator<T> {
    constructor(private ctor: ParameterlessConstructor<T>) {

    }
    getNew() {
        return new this.ctor();
    }
}

export default class Repository<T extends Aggregate> {
    constructor(private aggregateClass, private adapter: PersistenceAdaptor, private serializer: Serializer) {
    }

    async init() {
        await this.adapter.init();
    }

    async save(aggregate: T) {
        const events = Array.from(aggregate.uncommittedEvents);
        const snapshots = Array.from(aggregate.uncommittedSnapshots);

        const {serialize} = this.serializer;
        const serializedEvents = events.map(e => Object.assign({}, e, { payload: serialize(e.payload) }));
        await this.adapter.save(serializedEvents, snapshots);

        events.forEach(eventWrapper => {
            hook.execute(eventWrapper.type, eventWrapper.payload);
        });

        aggregate.uncommittedEvents.clear();
        aggregate.uncommittedSnapshots.clear();


        // cache.setKey(aggregate.id, aggregate);
    }

    async read(id: string): Promise<T> {
        let aggregate = await cache.getKey<T>(id);

        if (aggregate) {
            return aggregate;
        }
        else {
            const snapshot = await this.adapter.readSnapshot(id);
            const version = !snapshot ? 0 : snapshot.version;

            let aggregate: T = new this.aggregateClass();

            if (snapshot) {
                Object.assign(aggregate, snapshot.payload);
            }

            const events = await this.adapter.readEvents(id, version);
            if (!snapshot && events.length === 0) {
                return null;
            }
            else {
                events.forEach(event => {
                    const {type, payload} = event;
                    const handlerName = `On${type}`;
                    const handler = aggregate[handlerName];
                    const bound = handler.bind(aggregate);
                    bound(payload);
                });
            }

            return aggregate;
        }
    }
}