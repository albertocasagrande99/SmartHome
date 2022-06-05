const { Fridge, Light, DishWasher, SoftLight, Television, Window, Shutter, VacuumCleaner, DoorLock } = require('./Devices')
const Person = require('./People')
const Room = require('./Room')
const Observable =  require('../utils/Observable')
const Clock =  require('../utils/Clock')

class House {

    constructor () {
        this.people = {
            mario: new Person(this, 'Mario'),
            anna: new Person(this, 'Anna')
        }
        this.rooms = {
            kitchen: new Room('kitchen', [new Light(this, 'kitchenLight'), new Fridge(this,'fridge'), new DishWasher(this, 'dishwasher'), new Window(this,'kitchenWindow'), new Shutter(this,'kitchenShutter')], ['living_room', 'dining_room','hall']),
            dining_room: new Room('dining_room', [new Light(this, 'diningLight'), new Window(this,'diningWindow'), new Shutter(this,'diningShutter')], ['kitchen', 'garage', 'living_room', 'hall']),
            living_room: new Room('living_room', [new Light(this, 'livingLight'), new SoftLight(this,'softLightTV'), new Television(this,'TV'), new Window(this,'livingWindow'), new Shutter(this,'livingShutter'), new VacuumCleaner(this, 'vacuum', 'living_room')], ['dining_room', 'kitchen', 'hall']),
            garage: new Room('garage',[new Light(this, 'garageLight'), new Window(this,'garageWindow')], ['dining_room']),
            hall: new Room('hall', [new Light(this, 'hallLight'), new DoorLock(this, 'entranceDoorLock')], ['living_room','dining_room','kitchen','bedroom','bathroom','kids_bedroom']),
            bathroom: new Room('bathroom', [new Light(this, 'bathroomLight'), new Window(this,'bathroomWindow'), new Shutter(this,'bathroomShutter')], ['hall']),
            bedroom: new Room('bedroom', [new Light(this, 'bedroomLight'), new Window(this,'bedroomWindow'), new Shutter(this,'bedroomShutter')], ['hall']),
            kids_bedroom: new Room('kids_bedroom', [new Light(this, 'kidsBedroomLight'), new Window(this,'kidsBedroomWindow'), new Shutter(this,'kidsBedroomShutter')], ['hall'])
        }
        this.utilities = {
            electricity : new Observable( { consumption: this.rooms.kitchen.devices[1].electricityConsumption } )
        }

        this.people.anna.observe('in_room', (v, k)=>console.log('in_room Anna ' + v) )
        this.people.mario.observe('in_room', (v, k)=>console.log('in_room Mario ' + v) )

        //Observe metrics
        this.utilities.electricity.observe('consumption', (v, k) =>console.log('Electricity consumption ' + '\x1b[32m%s\x1b[0m', v) )

        //Observe room devices
        //Kitchen
        this.rooms.kitchen.devices[0].observe('status', (v, k)=>console.log('kitchen light status is ' + '\x1b[34m%s\x1b[0m', v) )
        //this.rooms.kitchen.devices[1].observe('status', (v, k)=>console.log('Fridge status is ' + '\x1b[34m%s\x1b[0m', v) )
        //this.rooms.kitchen.devices[2].observe('status', (v, k)=>console.log('Dishwasher status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.kitchen.devices[3].observe('status', (v, k)=>console.log('Kitchen window status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.kitchen.devices[4].observe('status', (v, k)=>console.log('Kitchen shutter status is ' + '\x1b[34m%s\x1b[0m', v) )

        //Living room
        this.rooms.living_room.devices[0].observe('status', (v, k)=>console.log('Living room light status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.living_room.devices[1].observe('status', (v, k)=>console.log('Living room soft light status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.living_room.devices[2].observe('status', (v, k)=>console.log('Television status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.living_room.devices[2].observe('activity', (v, k)=>console.log('Television mode is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.living_room.devices[3].observe('status', (v, k)=>console.log('Living room window status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.living_room.devices[4].observe('status', (v, k)=>console.log('Living room shutter status is ' + '\x1b[34m%s\x1b[0m', v) )

        //Garage
        this.rooms.garage.devices[0].observe('status', (v, k)=>console.log('Garage light status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.garage.devices[1].observe('status', (v, k)=>console.log('Garage window status is ' + '\x1b[34m%s\x1b[0m', v) )

        //Hall
        this.rooms.hall.devices[0].observe('status', (v, k)=>console.log('Hall light status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.hall.devices[1].observe('status', (v, k)=>console.log('Entrance door lock status is ' + '\x1b[34m%s\x1b[0m', v) )

        //Bathroom
        this.rooms.bathroom.devices[0].observe('status', (v, k)=>console.log('Bathroom light status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.bathroom.devices[2].observe('status', (v, k)=>console.log('Bathroom shutter status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.bathroom.devices[1].observe('status', (v, k)=>console.log('Bathroom window status is ' + '\x1b[34m%s\x1b[0m', v) )

        //Bedroom
        this.rooms.bedroom.devices[0].observe('status', (v, k)=>console.log('Bedroom light status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.bedroom.devices[2].observe('status', (v, k)=>console.log('Bedroom shutter status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.bedroom.devices[1].observe('status', (v, k)=>console.log('Bedroom window status is ' + '\x1b[34m%s\x1b[0m', v) )

        //Dining room
        this.rooms.dining_room.devices[0].observe('status', (v, k)=>console.log('Dining room light status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.dining_room.devices[2].observe('status', (v, k)=>console.log('Dining room shutter status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.dining_room.devices[1].observe('status', (v, k)=>console.log('Dining room window status is ' + '\x1b[34m%s\x1b[0m', v) )

        //Kids bedroom
        this.rooms.kids_bedroom.devices[0].observe('status', (v, k)=>console.log('Kids bedroom light status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.kids_bedroom.devices[2].observe('status', (v, k)=>console.log('Kids bedroom shutter status is ' + '\x1b[34m%s\x1b[0m', v) )
        this.rooms.garage.devices[1].observe('status', (v, k)=>console.log('Kids bedroom window status is ' + '\x1b[34m%s\x1b[0m', v) )
        
        Clock.startTimer()
        //Clock.wallClock()
    }
}

module.exports = House