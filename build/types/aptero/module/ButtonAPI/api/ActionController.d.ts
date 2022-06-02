export class ActionController {
    start(): Promise<void>;
    process(jsonData: any, id: any, sceneuuid: any, meshuuid: any, meshName: any, masterindex: any): void;
    processEntry(entry: any, elid: any, sceneuuid: any, meshuuid: any, meshName: any, pairIndex: any, masterindex: any, version: any): Promise<void>;
    createButtonOnElement(type: any, triggerId: any, actionsIds: any, element: any, position: any, rotationDeg: any, text: any, size: any, textWidth: any, style: any, version?: number, addReverse?: boolean): void;
}
