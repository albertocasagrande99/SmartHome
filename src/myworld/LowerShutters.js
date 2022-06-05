const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');
const Clock =  require('../utils/Clock')


class LowerShuttersGoal extends Goal {

    constructor (shutters = []) {
        super()

        /** @type {Array<Shutter>} shutters */
        this.shutters = shutters

    }

}

class LowerShuttersIntention extends Intention {
    
    constructor (agent, goal) {
        super(agent, goal)
        
        /** @type {Array<Shutter>} shutters */
        this.shutters = this.goal.shutters
    }
    
    static applicable (goal) {
        return goal instanceof LowerShuttersGoal
    }

    *exec () {
        var lowerShuttersGoals = []
        let LowerShuttersGoalPromise = new Promise( async res => {
            while (true) {
                let status = await Clock.global.notifyChange('hh')
                if(status == 23){
                    this.log("It's time to lower the shutters of the house!")
                    for(let s of this.shutters){
                        if(this.agent.beliefs.check('not shutter_down ' + s.name)){
                            s.lower()
                        }
                    }
                }
            }
        });

        lowerShuttersGoals.push(LowerShuttersGoalPromise)
        
        yield Promise.all(lowerShuttersGoals)
    }

}

module.exports = {LowerShuttersGoal, LowerShuttersIntention}