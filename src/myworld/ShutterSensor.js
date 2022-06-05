const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');



class SenseShuttersGoal extends Goal {

    constructor (shutters = []) {
        super()

        /** @type {Array<Shutter>} shutters */
        this.shutters = shutters

    }

}



class SenseShuttersIntention extends Intention {
    
    constructor (agent, goal) {
        super(agent, goal)
        
        /** @type {Array<Shutter>} shutters */
        this.shutters = this.goal.shutters
    }
    
    static applicable (goal) {
        return goal instanceof SenseShuttersGoal
    }
    *exec () {
        var shuttersGoals = []
        for (let s of this.shutters) {
            let shutterGoalPromise = new Promise( async res => {
                while (true) {
                    let status = await s.notifyChange('status')
                    if(status == 'down'){
                        this.log('sense: shutter ' + s.name + ' lowered ' + status)
                    }
                    else if(status == 'half'){
                        this.log('sense: shutter ' + s.name + ' set to ' + status)
                    }
                    else{
                        this.log('sense: shutter ' + s.name + ' raised ' + status)
                    }
                    this.agent.beliefs.declare('shutter_up '+s.name, status=='up')
                    this.agent.beliefs.declare('shutter_down '+s.name, status=='down')
                    this.agent.beliefs.declare('shutter_half '+s.name, status=='half')
                }
            });

            shuttersGoals.push(shutterGoalPromise)
        }
        yield Promise.all(shuttersGoals)
    }
}

module.exports = {SenseShuttersGoal, SenseShuttersIntention}