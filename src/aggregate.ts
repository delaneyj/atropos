import * as uuid from 'uuid';
import * as moment from 'moment';
import serializer from './serializer';

export interface EventMetadata {
    id: string;
    version: number;
    streamId: string;
    type: string;
    timestamp: string;
    payload: any;
}

export class Aggregate {
    readonly id: string;
    version: number;
    uncommittedEvents: Set<EventMetadata>;
    uncommittedSnapshots: Set<EventMetadata>;

    constructor(id: string = uuid.v4()) {
        this.id = id;
        this.version = 0;
        this.uncommittedEvents = new Set();
        this.uncommittedSnapshots = new Set();
    }

    snapshot(): void { }
    applySnapshot(payload: any): void { }

    deleteEventFromUncommitted(evt) {
        this.uncommittedEvents.delete(evt);
    }

    deleteSnapshotFromUncommitted(evt) {
        this.uncommittedSnapshots.delete(evt);
    }

    raiseEvent(payload: any) {
        const type = payload.constructor.name;

        if (type === 'Object') throw new Error(`Must be a class for dynamic invocation to work`);

        const event = {
            id: uuid.v4(),
            streamId: this.id,
            version: ++this.version,
            timestamp: moment().utc().format(),
            payload, type
        };

        this.uncommittedEvents.add(event);

        const handlerName = `On${type}`;
        const handler = this[handlerName];

        if (!handler) debugger;

        try {
            const bound = handler.bind(this);
            bound(payload);
        }
        catch (e) {
            const aggreateId = `${this.constructor.name}<${this.id}>`;
            const completeError = `Error handing ${type} on aggregate ${aggreateId}: ${e}`;
            throw new Error(completeError);
        }
        //Handle snapshotting later
    }
}