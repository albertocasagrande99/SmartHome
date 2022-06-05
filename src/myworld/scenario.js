const Clock =  require('../utils/Clock')
const Agent = require('../bdi/Agent')
const House = require('./House')
const {SenseLightsGoal, SenseLightsIntention} = require('./LightSensor')
const {SensePersonGoal, SensePersonIntention} = require('./PersonSensor')
const {SwitchOffGoal, SwitchOffIntention} = require('./SwitchOffLights')
const {SwitchOffTVGoal, SwitchOffTVIntention} = require('./TurnOffTV')
const {RaiseShuttersGoal, RaiseShuttersIntention} = require('./RaiseShutters')
const {LowerShuttersGoal, LowerShuttersIntention} = require('./LowerShutters')
const {SenseFilmGoal, SenseFilmIntention} = require('./FilmSensor')
const {FilmGoal, FilmIntention} = require('./FilmScenario')
const {SenseWindowsGoal, SenseWindowsIntention} = require('./WindowSensor')
const {SenseShuttersGoal, SenseShuttersIntention} = require('./ShutterSensor')
const {Move, Clean, RetryGoal, RetryFourTimesIntention} = require('./VacuumScenario')
const PlanningGoal = require('../pddl/PlanningGoal')
const {DoorLockGoal, DoorLockIntention} = require('./ManageDoorLock')
const {SenseDoorLockGoal, SenseDoorLockIntention} = require('./DoorLockSensor')
const {CloseWindowsGoal, CloseWindowsIntention} = require('./CloseWindows')

var house = new House()

// function that is used to change the beliefs of the agent about the rooms that are clean
// we take some rooms randomly and we call the undeclare method (those rooms are not clean anymore --> the vacuum cleaner will have to clean them)
// we can think of this function as a series of sensors installed in the various rooms that indicate to the vacuum cleaner which rooms are not clean
function getdirtyRooms(rooms){
    for(let room of rooms){
        if(Math.floor(Math.random() * 2) == 1 && room.name != 'garage'){
            house.rooms.living_room.devices[5].beliefs.undeclare('clean ' + room.name)
        }
    }
}

// Daily schedule
Clock.global.observe('mm', (key, mm) => {
    var time = Clock.global
    if(time.hh==7 && time.mm==30){
        getdirtyRooms([house.rooms.hall, house.rooms.kids_bedroom, house.rooms.bedroom, house.rooms.bathroom])
        house.rooms.living_room.devices[3].open()       //Open the window of the living room
        house.people.anna.moveTo('hall')
        house.people.mario.moveTo('hall')
    }
    if(time.hh==8 && time.mm==0){
        house.people.anna.moveTo('kitchen')
        house.people.mario.moveTo('kitchen')
    }
    if(time.hh==8 && time.mm==30){
        house.people.anna.moveTo('dining_room')
        house.people.mario.moveTo('dining_room')
    }
    if(time.hh==9 && time.mm==0){
        // every morning we want the vacuum cleaner to clean the sleeping area of the house (of course if rooms are not clean)
        house.rooms.living_room.devices[5].postSubGoal( new RetryGoal( { goal: new PlanningGoal( { goal: ['clean hall', 'clean bedroom', 'clean bathroom', 'clean kids_bedroom', 'at_room vacuum living_room'] } ) } ) )
    }
    if(time.hh==12 && time.mm==0){
        house.people.anna.moveTo('kitchen')
        house.people.mario.moveTo('kitchen')
    }
    if(time.hh==15 && time.mm==30){
        house.people.anna.moveTo('living_room')
        house.people.mario.moveTo('living_room')
    }
    if(time.hh==16 && time.mm==00){
        //WatchingFilm
        house.rooms.living_room.devices[2].turnOn()                       //Turn on the television
        house.rooms.living_room.devices[2].openPrimeVideo()               //Start prime video
        house.rooms.living_room.devices[2].selectFilm('Harry Potter')     //Select film
    }
    if(time.hh==18 && time.mm==00){
        house.rooms.living_room.devices[2].closePrimeVideo()              //Close prime video
        house.people.mario.moveTo('dining_room')
    }
    if(time.hh==19 && time.mm==0){
        house.people.anna.moveTo('kitchen')
        house.people.mario.moveTo('kitchen')
    }
    if(time.hh==20 && time.mm==15){
        house.people.anna.moveTo('living_room')
        house.people.mario.moveTo('living_room')
        getdirtyRooms([house.rooms.kitchen, house.rooms.living_room, house.rooms.dining_room])
    }
    if(time.hh==21 && time.mm==30){
        house.rooms.living_room.devices[5].postSubGoal( new RetryGoal( { goal: new PlanningGoal( { goal: ['clean living_room', 'clean kitchen', 'clean dining_room', 'at_room vacuum living_room'] } ) } ) )
    }
    if(time.hh==23 && time.mm==0){
        house.people.anna.moveTo('hall')
        house.people.mario.moveTo('hall')
        sleep(200).then(() => {
            house.people.anna.moveTo('bedroom')
            house.people.mario.moveTo('bedroom')
        });
        sleep(300).then(() => {
            house.rooms.bedroom.devices[0].switchOffLight()     // there is no way to automatically turn off the bedroom light at night. Residents turn it off when they want to fall asleep.
        });
    }
})

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

var houseAgent = new Agent('house_agent')               
var consumptionAgent = new Agent('consumption_agent')
var securityAgent = new Agent('security_agent')

let {OnlinePlanning} = require('../pddl/OnlinePlanner')([Move, Clean])
house.rooms.living_room.devices[5].intentions.push(OnlinePlanning)      //devices[5] represents the vacuum cleaner
house.rooms.living_room.devices[5].intentions.push(RetryFourTimesIntention)

function init_vacuum_belief(){
    // it is possible to access the beliefs of a device because the vacuum cleaner extends Agent
    house.rooms.living_room.devices[5].beliefs.declare('robot vacuum')
    house.rooms.living_room.devices[5].beliefs.declare('room kitchen')
    house.rooms.living_room.devices[5].beliefs.declare('room living_room')
    house.rooms.living_room.devices[5].beliefs.declare('room dining_room')
    house.rooms.living_room.devices[5].beliefs.declare('room hall')
    house.rooms.living_room.devices[5].beliefs.declare('room bathroom')
    house.rooms.living_room.devices[5].beliefs.declare('room bedroom')
    house.rooms.living_room.devices[5].beliefs.declare('room garage')
    house.rooms.living_room.devices[5].beliefs.declare('room kids_bedroom')
    house.rooms.living_room.devices[5].beliefs.declare('at_room vacuum living_room')    //the base station of the vacuum is in the living room
    house.rooms.living_room.devices[5].beliefs.declare('adjacent living_room kitchen')
    house.rooms.living_room.devices[5].beliefs.declare('adjacent kitchen living_room')
    house.rooms.living_room.devices[5].beliefs.declare('adjacent kitchen dining_room')
    house.rooms.living_room.devices[5].beliefs.declare('adjacent dining_room kitchen')
    house.rooms.living_room.devices[5].beliefs.declare('adjacent living_room hall')
    house.rooms.living_room.devices[5].beliefs.declare('adjacent hall living_room')
    house.rooms.living_room.devices[5].beliefs.declare('adjacent living_room dining_room')
    house.rooms.living_room.devices[5].beliefs.declare('adjacent dining_room living_room')
    house.rooms.living_room.devices[5].beliefs.declare('adjacent hall bathroom')
    house.rooms.living_room.devices[5].beliefs.declare('adjacent bathroom hall')
    house.rooms.living_room.devices[5].beliefs.declare('adjacent hall bedroom')
    house.rooms.living_room.devices[5].beliefs.declare('adjacent bedroom hall')
    house.rooms.living_room.devices[5].beliefs.declare('adjacent hall kids_bedroom')
    house.rooms.living_room.devices[5].beliefs.declare('adjacent kids_bedroom hall')
    house.rooms.living_room.devices[5].beliefs.declare('adjacent dining_room garage')
    house.rooms.living_room.devices[5].beliefs.declare('adjacent garage dining_room')
}

init_vacuum_belief()   //initialization of the beliefs of the vacuum cleaner (we assume the vacuum already knows the structure of the house)

// when the house agent detects that there is no one in a room, the beliefs of the vacuum cleaner are updated
// the vacuum cleaner thus has a narrow view of the world (it only knows the structure of the house and whether the various rooms are empty or not)
var sensor_empty = (agent) => (value,key,observable) => {
    let predicate = key.split(' ')[0]
    let arg1 = key.split(' ')[1]
    if (predicate=='empty')
        key = 'empty '+arg1;
    else{
        return;
    }
    value?agent.beliefs.declare(key):agent.beliefs.undeclare(key)
}

var sensor_shutters_windows = (agent) => (value, key, observable) => {
    let predicate = key.split(' ')[0]
    let arg1 = key.split(' ')[1]
    if (predicate == 'shutter_up' || predicate == 'shutter_down' || predicate == 'shutter_half' || predicate == 'window_opened' || predicate == 'window_closed')
        key = predicate + ' ' + arg1;
    else {
        return;
    }
    value ? agent.beliefs.declare(key) : agent.beliefs.undeclare(key)
}

houseAgent.beliefs.observeAny( sensor_empty(house.rooms.living_room.devices[5]) )
houseAgent.beliefs.observeAny( sensor_empty(consumptionAgent) )
houseAgent.beliefs.observeAny( sensor_shutters_windows(securityAgent) )

// ---------------------- House agent ----------------------

// Update beliefs of the agent about lights information
houseAgent.intentions.push(SenseLightsIntention)
houseAgent.postSubGoal( new SenseLightsGoal( [house.rooms.kitchen.devices[0], house.rooms.living_room.devices[0], house.rooms.living_room.devices[1], house.rooms.hall.devices[0], house.rooms.bedroom.devices[0], house.rooms.bathroom.devices[0], house.rooms.kids_bedroom.devices[0], house.rooms.garage.devices[0], house.rooms.dining_room.devices[0]] ) )

// Switch on lights when people enter in a room and update beliefs
houseAgent.intentions.push(SensePersonIntention)
houseAgent.postSubGoal(new SensePersonGoal( [house.people.anna, house.people.mario], house))

// Raise the shutters of the house in the morning when there is no one left in the bedroom
houseAgent.intentions.push(RaiseShuttersIntention)
houseAgent.postSubGoal(new RaiseShuttersGoal([house.rooms.kitchen.devices[4], house.rooms.living_room.devices[4], house.rooms.bathroom.devices[2], house.rooms.bedroom.devices[2], house.rooms.dining_room.devices[2], house.rooms.kids_bedroom.devices[2]]))

// Sense if a movie is starting in the living room
houseAgent.intentions.push(SenseFilmIntention)
houseAgent.postSubGoal(new SenseFilmGoal(house.rooms.living_room.devices[2]))

// Apply the film scenario in the living_room (switch on soft light, close the window, lower the shutter...)
houseAgent.intentions.push(FilmIntention)
houseAgent.postSubGoal(new FilmGoal(house.rooms.living_room))

// Windows sensor
houseAgent.intentions.push(SenseWindowsIntention)
houseAgent.postSubGoal(new SenseWindowsGoal([house.rooms.living_room.devices[3], house.rooms.kitchen.devices[3], house.rooms.bedroom.devices[1], house.rooms.kids_bedroom.devices[1], house.rooms.dining_room.devices[1], house.rooms.garage.devices[1], house.rooms.bathroom.devices[1]]))

// Shutters sensor
houseAgent.intentions.push(SenseShuttersIntention)
houseAgent.postSubGoal(new SenseShuttersGoal([house.rooms.kitchen.devices[4], house.rooms.living_room.devices[4], house.rooms.bathroom.devices[2], house.rooms.bedroom.devices[2], house.rooms.dining_room.devices[2], house.rooms.kids_bedroom.devices[2]]))

// ----------------- Energy consumption agent -----------------

// Switch off lights when there is nobody in a room
consumptionAgent.intentions.push(SwitchOffIntention)
consumptionAgent.postSubGoal(new SwitchOffGoal(house))

// Turn off the television when no one is watching it for more than 15 minutes
consumptionAgent.intentions.push(SwitchOffTVIntention)
consumptionAgent.postSubGoal(new SwitchOffTVGoal(house.rooms.living_room.devices[2]))

// ---------------------- Security agent ----------------------

// Lower the roller shutters at night
securityAgent.intentions.push(LowerShuttersIntention)
securityAgent.postSubGoal(new LowerShuttersGoal([house.rooms.kitchen.devices[4], house.rooms.living_room.devices[4], house.rooms.bathroom.devices[2], house.rooms.bedroom.devices[2], house.rooms.dining_room.devices[2], house.rooms.kids_bedroom.devices[2]]))

// Lock the entrance door from 23 to 7.
securityAgent.intentions.push(DoorLockIntention)
securityAgent.postSubGoal(new DoorLockGoal(house.rooms.hall.devices[1]))

// Sense if the entrance door is locked or not
securityAgent.intentions.push(SenseDoorLockIntention)
securityAgent.postSubGoal(new SenseDoorLockGoal(house.rooms.hall.devices[1]))

// Close all windows at night
securityAgent.intentions.push(CloseWindowsIntention)
securityAgent.postSubGoal(new CloseWindowsGoal([house.rooms.living_room.devices[3], house.rooms.kitchen.devices[3], house.rooms.bedroom.devices[1], house.rooms.kids_bedroom.devices[1], house.rooms.dining_room.devices[1], house.rooms.garage.devices[1], house.rooms.bathroom.devices[1]]))