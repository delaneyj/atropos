import * as test from 'tape';
import Serializers from '../serializer';
import {isObject} from 'lodash';

type TestObj = { title: string };
let obj = {
	title: "test"
};

test("stringify serialization is translatable", t => {
	let encoder = Serializers.stringify;
	let serialized = encoder.serialize(obj);
	let deserialized = encoder.deserialize<TestObj>(serialized);

	t.equal(deserialized.title, obj.title);
	t.equal(serialized, "{\"title\":\"test\"}");
	t.end();
});

test("zip serialization is translatable", t => {
	let encoder = Serializers.zip;
	let serialized = encoder.serialize(obj);
	let deserialized = encoder.deserialize<TestObj>(serialized);

	t.equal(deserialized.title, obj.title);
	t.equal(serialized.byteLength,36);
	t.end();
})

// it("through serialization is translatable", () => {
test("through serialization is translatable", t => {
	let encoder = Serializers.through;
	let serialized = encoder.serialize(obj);
	let deserialized = encoder.deserialize<TestObj>(serialized);
	t.equal(deserialized.title, obj.title);

	t.assert(isObject(serialized));

	t.end();
})