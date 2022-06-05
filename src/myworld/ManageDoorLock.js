const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');
const Clock =  require('../utils/Clock')


class DoorLockGoal extends Goal {

    constructor (doorLock) {
        super()

        /** @type {DoorLock} entrance door lock */
        this.doorLock = doorLock

    }

}

class DoorLockIntention extends Intention {
    
    constructor (agent, goal) {
        super(agent, goal)
        
        /** @type {DoorLock} entrance door lock */
        this.doorLock = this.goal.doorLock
    }
    
    static applicable (goal) {
        return goal instanceof DoorLockGoal
    }

    *exec () {
        var doorLockGoals = []
        let DoorLockGoalPromise = new Promise( async res => {
            while (true) {
                let status = await Clock.global.notifyChange('hh', 'door_lock')
                if(status == 23 && this.agent.beliefs.check('door_not_locked entrance')){
                    this.log("It's time to lock the entrance door!")
                    this.doorLock.lockDoor()
                }
                else if(status == 7 && this.agent.beliefs.check('door_locked entrance')){
                    this.log("It's time to unlock the entrance door!")
                    this.doorLock.unlockDoor()
                }
            }
        });

        doorLockGoals.push(DoorLockGoalPromise)
        
        yield Promise.all(doorLockGoals)
    }

}

module.exports = {DoorLockGoal, DoorLockIntention}