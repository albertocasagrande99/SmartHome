const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');


class SwitchOffGoal extends Goal {

    constructor (house) {
        super()

        /** @type {House} house */
        this.house = house

    }

}

class SwitchOffIntention extends Intention {
    
    constructor (agent, goal) {
        super(agent, goal)
        
        /** @type {House} house */
        this.house = this.goal.house
    }
    
    static applicable (goal) {
        return goal instanceof SwitchOffGoal
    }

    *exec () {
        var switchOffGoals = []
        let SwitchOffGoalPromise = new Promise( async res => {
            while (true) {
                let status = await this.agent.beliefs.notifyAnyChange()
                var belief = this.agent.beliefs
                for (const [key, value] of Object.entries(belief)){
                    if(key != "genericObservers"){
                        if(key.split(" ")[0] == 'empty'){
                            if(value==true){
                                if(this.house.rooms[key.split(" ")[1]].devices[0].status == 'on'){
                                    this.log('sense: there is no one in the ' + key.split(" ")[1])
                                    this.log("Let's turn off the", this.house.rooms[key.split(" ")[1]].devices[0].name)
                                    this.house.rooms[key.split(" ")[1]].devices[0].switchOffLight()
                                }
                            }
                        }
                    }
                }
            }
        });

        switchOffGoals.push(SwitchOffGoalPromise)
        
        yield Promise.all(switchOffGoals)
    }

}

module.exports = {SwitchOffGoal, SwitchOffIntention}