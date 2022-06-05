const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');


class SenseWindowsGoal extends Goal {

    constructor (windows = []) {
        super()

        /** @type {Array<Window>} windows */
        this.windows = windows

    }

}

class SenseWindowsIntention extends Intention {
    
    constructor (agent, goal) {
        super(agent, goal)
        
        /** @type {Array<Window>} windows */
        this.windows = this.goal.windows
    }
    
    static applicable (goal) {
        return goal instanceof SenseWindowsGoal
    }
    *exec () {
        var windowsGoals = []
        for (let w of this.windows) {  
            let windowGoalPromise = new Promise( async res => {
                while (true) {
                    let status = await w.notifyChange('status')
                    this.log('sense: window ' + w.name + ' has been ' + status)
                    this.agent.beliefs.declare('window_opened '+w.name, status=='opened')
                    this.agent.beliefs.declare('window_closed '+w.name, status=='closed')
                }
            });

            windowsGoals.push(windowGoalPromise)
        }
        yield Promise.all(windowsGoals)
    }

}


module.exports = {SenseWindowsGoal, SenseWindowsIntention}