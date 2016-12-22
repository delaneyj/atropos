import PersistanceAdapter from './adapter';
import { EventMetadata } from '../aggregate';
import { last } from 'lodash';
import * as Loki from 'lokijs';

export default class LokiDatabase implements PersistanceAdapter {
    db: Loki; 
    events: LokiCollection<EventMetadata>;
    snapshots: LokiCollection<EventMetadata>;

    constructor(private filename?: string) {
        this.db = new Loki(filename);
    }

    async init() {
        try {
            if (this.filename) {
                await new Promise((resolve, reject) => {
                    this.db.loadDatabase({}, err => {
                        if (err) reject();
                        else resolve();
                    });
                });
            }

            if (!this.db.collections.length) {
                this.events = this.db.addCollection<EventMetadata>('events');
                this.snapshots = this.db.addCollection<EventMetadata>('snapshots');
            }
            else {
                this.events = this.db.getCollection<EventMetadata>('events');
                this.snapshots = this.db.getCollection<EventMetadata>('snapshots');
            }
        }
        catch (e) {
            debugger;
        }
    }

    async save(events: EventMetadata[], snapshots: EventMetadata[]): Promise<void> {
        this.events.insert(events);
        this.snapshots.insert(snapshots);
        if (this.filename) {
            this.db.saveDatabase();
        }
        return Promise.resolve();
    }

    readSnapshot(streamId: string) {
        const snapshots = this.snapshots.chain().find({ streamId }).simplesort(`version`).data();
        const snapshot = last(snapshots);
        return Promise.resolve(snapshot);
    }

    async readEvents(streamId: string, version: number) {
        const events = this.events
            .chain()
            .find({ streamId })
            .where(p => p.version > version)
            .simplesort('version')
            .data();

        // let events = this.events.where(p => p.streamId === streamId && p.version > version).simplesort("version").data();
        return Promise.resolve(events);
    }

    clean() {
        this.events.removeDataOnly()
        this.snapshots.removeDataOnly()
    }
}