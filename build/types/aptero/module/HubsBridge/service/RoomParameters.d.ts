export class RoomParameters {
    fetch: boolean;
    getParameters(roomSID: any): Promise<any>;
    customPermission(): string[];
    canMove(entity: any): boolean;
    applyPermissionAsync(permission: any, admin: any): Promise<any>;
    applyDefaultAudioSettingsSystem(audioSettingsSystem: any): Promise<void>;
    getRoomParameters(): Promise<any>;
    roomConfig: any;
    applyRoomParameters(): Promise<any>;
}
export const roomParameters: RoomParameters;
