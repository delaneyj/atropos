import {EventMetadata} from '../aggregate';

interface PersistanceAdapter {
    init():Promise<void>;
    save(events:EventMetadata[], snapshots:EventMetadata[]): Promise<void>;
    readSnapshot(id:string): Promise<EventMetadata>;
    readEvents(id:string,fromVersion:number):Promise<EventMetadata[]>;
}

export default PersistanceAdapter;