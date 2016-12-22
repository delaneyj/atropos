import * as test from 'tape';
import cache from '../cache';

test("cache", async t => {
    const key = "1";
    const value = "test";
    await cache.setKey(key, value);
    const result = await cache.getKey<string>(key);

    t.equal(result, value);
    t.end();
})


test("clone", async t => {
    type TestObj = { desc: string };
    let obj = { desc: "test" };
    cache.setKey("1", obj);
    obj.desc = "test2";

    const result = await cache.getKey<TestObj>("1");
    t.equal(result.desc, 'test');
    t.end();
});