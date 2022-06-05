const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');
const Clock =  require('../utils/Clock')

class SwitchOffTVGoal extends Goal {

    constructor (television) {
        super()

        /** @type {Television} television */
        this.television = television

    }

}

class SwitchOffTVIntention extends Intention {
    
    constructor (agent, goal) {
        super(agent, goal)
        
        /** @type {Television} television */
        this.television = this.goal.television
    }
    
    static applicable (goal) {
        return goal instanceof SwitchOffTVGoal
    }

    *exec () {
        var switchOffGoals = []
        let SwitchOffGoalPromise = new Promise( async res => {
            while (true) {
                let status = await Clock.global.notifyChange('mm')
                if(this.agent.beliefs.check('empty living_room')){         //check through beliefs of the agent
                    if(this.television.status == 'on'){
                        this.log("Nobody is watching TV in living_room. Let's turn it off.")   
                        this.television.turnOff()
                    }
                }
            }
        });

        switchOffGoals.push(SwitchOffGoalPromise)
        
        yield Promise.all(switchOffGoals)
    }

}

module.exports = {SwitchOffTVGoal, SwitchOffTVIntention}