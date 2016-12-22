import * as zlib from 'zlib';

import configuration from './configuration';
import {EventMetadata} from './aggregate';

export interface Serializer {
	serialize<T extends EventMetadata>(obj:T): string | Buffer;
	deserialize<T extends EventMetadata>(data: string | Buffer): T;
}

class StringifySerializer {
	serialize(obj) {
		return JSON.stringify(obj);
	}

	deserialize<T>(serialized: string):T {
		return JSON.parse(serialized);
	}
}

class ZipSerializer {
	serialize(obj) {
		const json = JSON.stringify(obj);
		const buffer = new Buffer(json, 'utf8');
		return zlib.gzipSync(buffer);
	}

	deserialize<T>(serialized: Buffer):T {
		const unzipped = zlib.gunzipSync(serialized);
		const json = unzipped.toString('utf8');
		return JSON.parse(json);
	}
}

class ThroughSerializer {
	serialize(obj) {
		return obj;
	}

	deserialize<T>(serialized:any):T {
		return serialized
	}
}

export default {
	stringify:new StringifySerializer(),
	zip:new ZipSerializer(),
	through: new ThroughSerializer()
}