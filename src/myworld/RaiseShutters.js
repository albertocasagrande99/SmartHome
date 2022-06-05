const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');
const Clock =  require('../utils/Clock')


class RaiseShuttersGoal extends Goal {

    constructor (shutters = []) {
        super()

        /** @type {Array<Shutter>} shutters */
        this.shutters = shutters

    }

}

class RaiseShuttersIntention extends Intention {
    
    constructor (agent, goal) {
        super(agent, goal)
        
        /** @type {Array<Shutter>} shutters */
        this.shutters = this.goal.shutters
    }
    
    static applicable (goal) {
        return goal instanceof RaiseShuttersGoal
    }

    *exec () {
        var raiseShuttersGoals = []
        let RaiseShuttersGoalPromise = new Promise( async res => {
            while (true) {
                let status = await this.agent.beliefs.notifyChange('empty bedroom')
                if(Clock.global.hh > 6 && Clock.global.hh < 9){
                    this.log("No one left in the bedroom. It's time to raise the shutters of the house!")
                    for(let s of this.shutters){
                        if(this.agent.beliefs.check('shutter_down ' + s.name)){
                            s.raise()
                        }
                    }
                }
            }
        });

        raiseShuttersGoals.push(RaiseShuttersGoalPromise)
        
        yield Promise.all(raiseShuttersGoals)
    }

}

module.exports = {RaiseShuttersGoal, RaiseShuttersIntention}