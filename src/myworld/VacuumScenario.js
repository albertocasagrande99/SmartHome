const pddlActionIntention = require('../pddl/actions/pddlActionIntention')
const Agent = require('../bdi/Agent')
const Goal = require('../bdi/Goal')
const Intention = require('../bdi/Intention')
const PlanningGoal = require('../pddl/PlanningGoal')
const Clock =  require('../utils/Clock')

/**
 * Vacuum agent
 */

class myAction extends pddlActionIntention {
    async checkPreconditionAndApplyEffect () {
        if ( this.checkPrecondition() ) {
            await Clock.global.notifyChange('mm', 'plan')
            this.applyEffect()
            //await new Promise(res=>setTimeout(res,500))
        }
        else
            throw new Error('pddl precondition not valid'); //Promise is rejected!
    }
}

class Move extends myAction {
    static parameters = ['vacuum', 'source', 'destination'];
    static precondition = [ ['room', 'source'], ['room', 'destination'], ['robot', 'vacuum'], ['at_room', 'vacuum', 'source'], ['adjacent', 'source', 'destination'] ];
    static effect = [ ['not at_room', 'vacuum', 'source'], ['at_room', 'vacuum', 'destination'] ];
    *exec ({vacuum, source, destination}=parameters) {
        yield this.checkPreconditionAndApplyEffect(), this.agent.move(destination)
    }
}

class Clean extends myAction {
    static parameters = ['vacuum', 'room'];
    static precondition = [ ['robot', 'vacuum'], ['room', 'room'], ['at_room', 'vacuum', 'room'], ['empty', 'room']];
    static effect = [ ['clean', 'room'] ];
    *exec ({vacuum, room}=parameters) {
        yield this.checkPreconditionAndApplyEffect(), this.agent.clean(room)
    }
}

class RetryGoal extends Goal {}
class RetryFourTimesIntention extends Intention {
    static applicable (goal) {
        return goal instanceof RetryGoal
    }
    *exec ({goal}=parameters) {
        for(let i=0; i<4; i++) {
            let goalAchieved = yield this.agent.postSubGoal( goal )
            if (goalAchieved)
                return;
            this.log('wait for something to change on beliefset before retrying for the ' + (i+2) + 'th time goal', goal.toString())
            //yield this.agent.beliefs.notifyAnyChange()
            yield this.agent.beliefs.notifyChange('empty '+ goal.parameters.goal[0].split(" ")[1]), this.log(goal.parameters.goal[0].split(" ")[1] + " is now empty, we can proceed to clean up")
        }
    }
}

module.exports = {Move, Clean, RetryGoal, RetryFourTimesIntention}