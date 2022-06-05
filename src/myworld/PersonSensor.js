const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');



class SensePersonGoal extends Goal {

    constructor (people = [], house) {
        super()

        /** @type {Array<People>} people */
        this.people = people
        this.house = house

    }

}

class SensePersonIntention extends Intention {
    
    constructor (agent, goal) {
        super(agent, goal)
        
        /** @type {Array<People>} people */
        this.people = this.goal.people
        this.house = this.goal.house
    }
    
    static applicable (goal) {
        return goal instanceof SensePersonGoal
    }
    *exec () {
        var peopleGoals = []
        for (let p of this.people) {
            let personGoalPromise = new Promise( async res => {
                while (true) {
                    let status = await p.notifyChange('in_room')
                    this.log('sense: person ' + p.name + ' moved to ' + status)
                    if(this.house.rooms[status].devices[0].status=='off'){    // if the main light of the room is off, turn it on
                        this.log("Let's turn on the", this.house.rooms[status].devices[0].name)
                        this.house.rooms[status].devices[0].switchOnLight()
                    }
                    // change beliefs of the agent
                    this.agent.beliefs.declare('person_in_room '+p.name + ' ' + status)
                    this.agent.beliefs.undeclare('empty ' + status)
                    for(let room in this.house.rooms){
                        if(room != status){
                            this.agent.beliefs.undeclare('person_in_room '+p.name + ' ' + room)
                        }
                    }


                    //Set empty rooms
                    var belief = this.agent.beliefs
                    let r = [] //r contains the rooms in which there is someone
                    // for each element in the beliefset of the agent, we save all the rooms in which there is someone in a vector
                    for (const [key, value] of Object.entries(belief)){
                        if(key != "genericObservers"){
                            if(key.split(" ")[0] == 'person_in_room'){
                                if(value==true){
                                    r.push(this.house.rooms[key.split(" ")[2]].name)
                                }
                            }
                        }
                    }
                    // for each room in the house, we check if that room is present is our vector r, if it is not present then it means that there isn't anyone in that room
                    // so we update the beliefs of the agent by declaring which rooms are empty
                    for(let room in this.house.rooms){
                        if(!(r.includes(room))){
                            this.agent.beliefs.declare('empty '+room)
                        }
                    }
                }
            });

            peopleGoals.push(personGoalPromise)
        }
        yield Promise.all(peopleGoals)
    }
}

module.exports = {SensePersonGoal, SensePersonIntention}