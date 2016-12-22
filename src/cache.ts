import configuration from './configuration';
import * as NodeCache from 'node-cache';

class Cache {
    cache: NodeCache.NodeCache
    constructor() {
        this.cache = new NodeCache({ stdTTL: configuration.cacheExpiration, checkperiod: configuration.cacheDeleteCheckInterval })
    }

    setKey(key: string, obj) {
        this.cache.set(key, obj);
        return Promise.resolve();
    }

    getKey<T>(key: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.cache.get(key, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    }

    removeAll() {
        this.cache.flushAll()
    }
}

const singleton = new Cache();
export default singleton;