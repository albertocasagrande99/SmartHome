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
    async checkPreconditionAndApplyEffect (duration) {
        if ( this.checkPrecondition() ) {
            //await Clock.global.notifyChange('mm', 'plan')
            await new Promise(res=>setTimeout(res, duration))
            this.applyEffect()
        }
        else
            throw new Error('pddl precondition not valid'); //Promise is rejected!
    }
}

class Move extends myAction {
    static parameters = ['vacuum', 'source', 'destination'];
    static precondition = [ ['room', 'source'], ['room', 'destination'], ['robot', 'vacuum'], ['at_room', 'vacuum', 'source'], ['adjacent', 'source', 'destination'], ['on', 'vacuum'] ];
    static effect = [ ['not at_room', 'vacuum', 'source'], ['at_room', 'vacuum', 'destination'] ];
    *exec ({vacuum, source, destination}=parameters) {
        let duration = 25
        this.agent.device.move(destination)
        yield this.checkPreconditionAndApplyEffect(duration)
    }
}

class Clean extends myAction {
    static parameters = ['vacuum', 'room'];
    static precondition = [ ['robot', 'vacuum'], ['room', 'room'], ['at_room', 'vacuum', 'room'], ['empty', 'room'], ['on', 'vacuum']];
    static effect = [ ['clean', 'room'] ];
    *exec ({vacuum, room}=parameters) {
        let duration = 300
        this.agent.device.clean(room)
        yield this.checkPreconditionAndApplyEffect(duration)
    }
}

class TurnOn extends myAction {
    static parameters = ['vacuum'];
    static precondition = [ ['robot', 'vacuum'], ['off', 'vacuum']];
    static effect = [ ['not off', 'vacuum'], ['on', 'vacuum'] ];
    *exec ({vacuum}=parameters) {
        let duration = 5
        this.agent.device.turnOn()
        yield this.checkPreconditionAndApplyEffect(duration)
    }
}

class TurnOff extends myAction {
    static parameters = ['vacuum'];
    static precondition = [ ['robot', 'vacuum'], ['on', 'vacuum']];
    static effect = [ ['not on', 'vacuum'], ['off', 'vacuum'] ];
    *exec ({vacuum}=parameters) {
        let duration = 5
        this.agent.device.turnOff()
        yield this.checkPreconditionAndApplyEffect(duration)
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

module.exports = {Move, Clean, TurnOn, TurnOff, RetryGoal, RetryFourTimesIntention}