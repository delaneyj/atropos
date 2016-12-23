import * as zlib from 'zlib';
import * as cbor from 'cbor';
import {EventMetadata} from './aggregate';

export interface Serializer {
	serialize<T extends EventMetadata>(obj:T): string | Buffer;
	deserialize<T extends EventMetadata>(data: string | Buffer): T;
}

export class JSONSerializer {
	serialize(obj) {
		return JSON.stringify(obj);
	}

	deserialize<T>(serialized: string):T {
		return JSON.parse(serialized);
	}
}

export class ZipSerializer {
	serialize(obj) {
		const json = JSON.stringify(obj);
		const buffer = new Buffer(json, 'utf8');
		const compressedBuffer = zlib.gzipSync(buffer);
		return compressedBuffer;
	}

	deserialize<T>(serialized: Buffer):T {
		const unzipped = zlib.gunzipSync(serialized);
		const json = unzipped.toString('utf8');
		return JSON.parse(json);
	}
}


export class CBORSerializer {
	serialize(obj) {
		const cborBuffer = cbor.encode(obj);
		return cborBuffer;
	}

	deserialize<T>(serialized: Buffer):T {
		const obj:T = cbor.decode(serialized);
		return obj;
	}
}

export class ThroughSerializer {
	serialize(obj) {
		return obj;
	}

	deserialize<T>(serialized:any):T {
		return serialized
	}
}