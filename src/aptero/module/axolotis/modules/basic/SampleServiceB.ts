import {injectable} from "inversify";

export const SampleServiceBName = Symbol.for("SampleServiceBName");

@injectable()
export class SampleServiceB {

    constructor() {
        //console.log("SampleServiceB : created");
    }

}

