const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');


class FilmGoal extends Goal {

    constructor (living_room) {
        super()

        /** @type {Room} living room */
        this.living_room = living_room

    }

}

class FilmIntention extends Intention {
    
    constructor (agent, goal) {
        super(agent, goal)
        
        /** @type {Room} living room */
        this.living_room = this.goal.living_room
    }
    
    static applicable (goal) {
        return goal instanceof FilmGoal
    }

    *exec () {
        var filmGoals = []
        let FilmGoalPromise = new Promise( async res => {
            while (true) {
                let status = await this.agent.beliefs.notifyChange('television_mode watching_prime')
                if(status){
                    this.log("Film scenario! Let's create a cinema atmosphere!")
                    if(this.agent.beliefs.check('light_on livingLight')){         //check through beliefs of the agent
                        this.living_room.devices[0].switchOffLight()
                    }
                    if(this.agent.beliefs.check('window_opened livingWindow')){   //check through beliefs of the agent
                        this.living_room.devices[3].close()
                    }
                    if(!this.agent.beliefs.check('light_on softLightTV')){        //check through beliefs of the agent
                        this.living_room.devices[1].switchOnLight()
                    }
                    if(!this.agent.beliefs.check('shutter_down livingShutter')){  //check through beliefs of the agent
                        this.living_room.devices[4].lower()
                    }
                }else if(!this.agent.beliefs.check('empty living_room')){
                    this.log("Residents are no longer watching a movie on TV")
                    if(!this.agent.beliefs.check('light_on livingLight')){         //check through beliefs of the agent
                        this.living_room.devices[0].switchOnLight()
                    }
                    if(!this.agent.beliefs.check('window_opened livingWindow')){   //check through beliefs of the agent
                        this.living_room.devices[3].open()
                    }
                    if(this.agent.beliefs.check('light_on softLightTV')){        //check through beliefs of the agent
                        this.living_room.devices[1].switchOffLight()
                    }
                    if(this.agent.beliefs.check('shutter_down livingShutter')){  //check through beliefs of the agent
                        this.living_room.devices[4].raise()
                    }
                }
            }
        });

        filmGoals.push(FilmGoalPromise)
        
        yield Promise.all(filmGoals)
    }
}

module.exports = {FilmGoal, FilmIntention}