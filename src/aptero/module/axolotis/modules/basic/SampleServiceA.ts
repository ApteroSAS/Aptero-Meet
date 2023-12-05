import {inject, injectable} from "inversify";
import {SampleServiceB, SampleServiceBName} from "./SampleServiceB";

export const SampleServiceAName = Symbol.for("SampleServiceAName");

@injectable()
export class SampleServiceA {

    constructor(
        @inject(SampleServiceBName) private sampleServiceB: SampleServiceB,
    ) {
        //console.log("SampleServiceA : created");
    }

}
