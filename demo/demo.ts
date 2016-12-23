import * as uuid from 'uuid';
import Repository from '../src/repository';
import Loki from '../src/persistence/loki';
import { Aggregate, EventMetadata } from '../src/aggregate';
import {ZipSerializer} from '../src/serializer';

class UserInfoCreated {
    constructor(private name, private surname, private address, private mobile) {
    }
}

class AddressUpdated {
    constructor(private address: string) {
    }
}

class MobileUpdated {
    constructor(private mobile: string) {
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

    get mobile() {
        return this._mobile;
    }

    get address() {
        return this._address;
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
    
    //Apply events
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
}


async function doIt() {
    const persistence = new Loki(`atropos.json`);
    const repository = new Repository<UserInfoAggregate>(UserInfoAggregate, persistence, new ZipSerializer());
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