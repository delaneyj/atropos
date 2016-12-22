import * as uuid from 'uuid';
import Repository from '../src/repository';
import Loki from '../src/persistence/loki';
import { Aggregate, EventMetadata } from '../src/aggregate';
import serializer from '../src/serializer';

class UserInfoCreated {
    name: string;
    surname: string;
    address: string;
    mobile: string;

    constructor(name, surname, address, mobile) {
        this.name = name;
        this.surname = surname;
        this.address = address;
        this.mobile = mobile;
    }
}

class AddressUpdated {
    address: string;

    constructor(address: string) {
        this.address = address;
    }
}

class MobileUpdated {
    mobile: string;

    constructor(mobile: string) {
        this.mobile = mobile;
    }
}

class UserInfoAggregate extends Aggregate {
    _name: string;
    _surname: string;
    _address: string;
    _mobile: string;

    snapshot() {
        return Object.assign({}, this);
    }

    applySnapshot(payload) {
        Object.assign(this, payload);
    }

    //Mutators
    initialize(name, surname, address, mobile) {
        this.raiseEvent(new UserInfoCreated(name, surname, address, mobile));
    }

    updateAddress(address) {
        this.raiseEvent(new AddressUpdated(address));
    }

    updateMobile(mobile) {
        this.raiseEvent(new MobileUpdated(mobile));
    }

    //Apply
    OnUserInfoCreated(payload) {
        this._name = payload.name
        this._surname = payload.surname
        this._address = payload.address
        this._mobile = payload.mobile
    }

    OnAddressUpdated(payload) {
        this._address = payload.address
    }

    OnMobileUpdated(payload) {
        this._mobile = payload.mobile
    }

    get mobile(){
        return this._mobile;
    }

    get address(){
        return this._address;
    }
}


async function doIt() {
    const persistence = new Loki();
    const repository = new Repository<UserInfoAggregate>(UserInfoAggregate, persistence, serializer.stringify);
    await repository.init();

    try {
        let userInfoAggregate = new UserInfoAggregate();
        userInfoAggregate.initialize("Gennaro", "Del Sorbo", "Main Street", "09762847");
        await repository.save(userInfoAggregate);


        userInfoAggregate.updateMobile("333");
        userInfoAggregate.updateMobile("334");
        userInfoAggregate.updateMobile("335");
        userInfoAggregate.updateAddress("12, Main St.")
        userInfoAggregate.updateAddress("15, Main St.");
        await repository.save(userInfoAggregate)

        console.log("all saved")

        console.log("try a read")
        const userInfo = await repository.read(userInfoAggregate.id);
        console.log(userInfo.mobile)
        console.log(userInfo.address)
    }
    catch (e) {
        debugger;
    }
}


doIt();