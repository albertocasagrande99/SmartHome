const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');


class SenseDoorLockGoal extends Goal {

    constructor (doorLock) {
        super()

        /** @type {DoorLock} entrance door lock */
        this.doorLock = doorLock

    }

}

class SenseDoorLockIntention extends Intention {
    
    constructor (agent, goal) {
        super(agent, goal)
        
        /** @type {DoorLock} entrance door lock */
        this.doorLock = this.goal.doorLock
    }
    
    static applicable (goal) {
        return goal instanceof SenseDoorLockGoal
    }

    *exec () {
        var doorLockGoals = []
        let DoorLockPromise = new Promise( async res => {
            while (true) {
                let status = await this.doorLock.notifyChange('status')
                this.log('sense: entrance door lock status is changed to ' + status)
                this.agent.beliefs.declare('door_locked entrance', status=='door_locked')
                this.agent.beliefs.declare('door_not_locked entrance', status=='door_not_locked')
            }
        });

        doorLockGoals.push(DoorLockPromise)
        
        yield Promise.all(doorLockGoals)
    }
}

module.exports = {SenseDoorLockGoal, SenseDoorLockIntention}