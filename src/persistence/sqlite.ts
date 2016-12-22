import { existsSync } from 'fs';
import * as sqlite3 from 'sqlite3';
import * as uuid from 'uuid';

import PersistenceAdapter from './adapter';


export class Sqlite implements PersistenceAdapter {
    db: sqlite3.Database;
    initiliazed: boolean;

    constructor(filename: string = 'atropos.db', verbose: boolean = true) {
        if (verbose) sqlite3.verbose();

        const exists = existsSync(filename);
        this.db = new sqlite3.Database(filename);
        this.initiliazed = false;
    }

    async init() {
        const promise = new Promise(resolve => {
            this.db.serialize(() => {
                if (!this.initiliazed) {
                    this.db.run("CREATE TABLE Events (id TEXT, streamId TEXT, version INTEGER, timestamp TEXT, eventType TEXT, payload BLOB)");
                    this.db.run("CREATE TABLE Snapshots (id TEXT, streamId TEXT, version INTEGER, timestamp TEXT, payload BLOB)");
                    this.initiliazed = true;
                }

                resolve();
            });
        });
        await promise;
    }

    async save(events, snapshots) {
        const self = this;
        const promise = new Promise((resolve, reject) => {
            self.db.serialize(() => {
                try {
                    self.db.run("BEGIN TRANSACTION")

                    events.forEach(e => {
                        self.db.run("INSERT INTO Events VALUES (?, ?, ?, ?, ?, ?)", uuid.v4(), e.streamId, e.version, new Date(), e.eventType, e.payload);
                    });

                    snapshots.forEach(e => {
                        self.db.run("INSERT INTO Snapshots VALUES (?, ?, ?, ?, ?)", uuid.v4(), e.streamId, e.version, new Date(), e.payload)
                    });

                    self.db.run("COMMIT TRANSACTION")
                    resolve();
                } catch (err) {
                    self.db.run("ROLLBACK TRANSACTION")
                    reject(err);
                }
            })
        });

        await promise;
    }

    //return a promise
    readSnapshot(id) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM Snapshots WHERE streamId = ? ORDER BY version DESC LIMIT 1", [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        })
    }

    //return a promise
    readEvents(id, fromVersion) {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM Events WHERE streamId = ? AND version > ? ORDER BY version", [id, fromVersion], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        })
    }
}