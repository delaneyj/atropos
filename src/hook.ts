
type HookHandler = (payload: any) => {};

class Hook {
    hooks: Map<string, HookHandler>;

    constructor() {
        this.hooks = new Map();
    }

    register(eventName: string, fn: HookHandler) {
        if (this.hooks.has(eventName)) {
            throw new Error(`This hook already has been registered.`);
        }

        this.hooks.set(eventName, fn);
    }

    execute(eventName: string, payload: any) {
        const hook = this.hooks.get(eventName);

        if (hook) {
            hook(payload);
        }
    }
}

const hook = new Hook();
export default hook;