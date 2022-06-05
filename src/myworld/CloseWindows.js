const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');
const Clock =  require('../utils/Clock')


class CloseWindowsGoal extends Goal {

    constructor (windows = []) {
        super()

        /** @type {Array<Window>} windows */
        this.windows = windows

    }

}

class CloseWindowsIntention extends Intention {
    
    constructor (agent, goal) {
        super(agent, goal)
        
        /** @type {Array<Window>} windows */
        this.windows = this.goal.windows
    }
    
    static applicable (goal) {
        return goal instanceof CloseWindowsGoal
    }

    *exec () {
        var closeWindowsGoals = []
        let CloseWindowsGoalPromise = new Promise( async res => {
            while (true) {
                let status = await Clock.global.notifyChange('hh', 'close_windows')
                if(status == 23){
                    for (let w of this.windows){
                        if(this.agent.beliefs.check('window_opened ' + w.name)){
                            this.log(w.name + " is opened! Let's close it.")
                            w.close()
                        }                     
                    }
                }
            }
        });

        closeWindowsGoals.push(CloseWindowsGoalPromise)
        
        yield Promise.all(closeWindowsGoals)
    }

}

module.exports = {CloseWindowsGoal, CloseWindowsIntention}