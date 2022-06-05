const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');


class SenseFilmGoal extends Goal {

    constructor (television) {
        super()

        /** @type {Television} television */
        this.television = television

    }

}

class SenseFilmIntention extends Intention {
    
    constructor (agent, goal) {
        super(agent, goal)
        
        /** @type {Television} television */
        this.television = this.goal.television
    }
    
    static applicable (goal) {
        return goal instanceof SenseFilmGoal
    }

    *exec () {
        var filmGoals = []
        let FilmGoalPromise = new Promise( async res => {
            while (true) {
                let status = await this.television.notifyChange('activity')
                this.log('sense: television mode is changed to ' + status)
                this.agent.beliefs.declare('television_mode watching_DTT', status=='watching_DTT')
                this.agent.beliefs.declare('television_mode watching_prime', status=='watching_prime')
            }
        });

        filmGoals.push(FilmGoalPromise)
        
        yield Promise.all(filmGoals)
    }
}

module.exports = {SenseFilmGoal, SenseFilmIntention}