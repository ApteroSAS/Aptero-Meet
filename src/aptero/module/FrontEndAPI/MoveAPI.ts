export class MoveAPI {
    moveToWaypoint(waypoint: string) {
        if (waypoint.startsWith("#")) {
            waypoint = waypoint.slice(1);
        }
        if (!this.listWayPoints().includes(waypoint)) {
            throw new Error(`Waypoint ${waypoint} not found. possible waypoints: ${this.listWayPoints().join(", ")} `);
        }
        window.history.pushState(null, null, `#${waypoint}`);
    }

    listWayPoints(): string[] {
        const objects = Array.from(document.querySelector('#environment-scene').querySelectorAll("a-entity"));
        const avatars = Array.from(document.querySelectorAll('#avatar-rig'))
        let result = [];
        const filterComponent = ["waypoint"]
        for (let objectEl of [...avatars, ...objects]) {
            const object = objectEl as any;
            const object3D = object.object3D;
            let name = object3D && object3D.name;
            if (name) {
                const components = Object.keys(object3D.el?.components || {}) || [];
                if (components.some((component) => filterComponent.includes(component))) {
                    result.push(name);
                }
            }
        }
        return result;
    }
}