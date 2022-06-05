const Observable =  require('../utils/Observable')
const Agent = require('../bdi/Agent')

//DEVICES
class Light extends Observable {
    constructor (house, name) {
        super(house);
        this.house = house;
        this.name = name;
        this.set('status', 'off');
        this.power = 10
    }
    switchOnLight (l) {
        this.status = 'on'
        this.house.utilities.electricity.consumption += this.power;   //consumption agent
    }
    switchOffLight (l) {
        this.status = 'off'
        this.house.utilities.electricity.consumption -= this.power;   //consumption agent
    }
    disconnectLight (l) {
        this.status = 'disconnected'
    }
}

class SoftLight extends Light{
    constructor(house, name){
        super(house, name);
        this.power = 5;
    }
}

class Fridge extends Observable {
    constructor (house, name){
        super(house,name)
        this.house = house;
        this.name = name;
        this.set('status', 'half_full')
        this.electricityConsumption = 100;
    }
    setFull (f){
        let prevStatus = this.status;
        this.status = 'full';
        if(prevStatus == 'empty'){
            this.house.utilities.electricity.consumption += 100;
        }
        else if(prevStatus == 'half_full'){
            this.house.utilities.electricity.consumption += 50;
        }
    }
    setHalfFull (f){
        let prevStatus = this.status;
        this.status = 'half_full';
        if(prevStatus == 'empty'){
            this.house.utilities.electricity.consumption += 50;
        }
        else if(prevStatus == 'full'){
            this.house.utilities.electricity.consumption -= 50;
        }
    }
    setEmpty (f){
        let prevStatus = this.status;
        this.status = 'empty';
        if(prevStatus == 'full'){
            this.house.utilities.electricity.consumption -= 100;
        }
        else if(prevStatus == 'half_full'){
            this.house.utilities.electricity.consumption -= 50;
        }
    }
}

class DishWasher extends Observable{
    constructor (house, name) {
        super(house, name);
        this.house = house;
        this.name = name;
        this.set('status', 'off');
        this.electricityConsumption = 1200
    }
    turnOn(){
        if(this.status == 'off'){
            this.status = 'running';
            this.house.utilities.electricity.consumption += this.electricityConsumption;
        }
    }
    turnOff(){
        if(this.status == 'running' || this.status == 'paused'){
            this.status = 'off';
            this.house.utilities.electricity.consumption -= this.electricityConsumption;
        }
    }
    pause(){
        if(this.status == 'running'){
            this.status = 'paused';
            this.house.utilities.electricity.consumption -= this.electricityConsumption;
        }
    }
    resume(){
        if(this.status == 'paused'){
            this.status = 'running';
            this.house.utilities.electricity.consumption += this.electricityConsumption;
        }
    }
}

class Television extends Observable{
    constructor(house, name){
        super(house, name);
        this.house = house;
        this.name = name;
        this.set('status', 'off');
        this.set('activity', 'watching_DTT');
        this.set('channel', );
        this.set('film', '-');
        this.power = 200;
    }
    turnOn(){
        this.status = 'on';
        this.house.utilities.electricity.consumption += this.power;
    }
    turnOff(){
        this.status = 'off';
        if(this.activity == 'watching_prime'){
            this.activity = 'watching_DTT';
        }  
        this.house.utilities.electricity.consumption -= this.power;
    }
    setChannel(c){
        if(this.status == 'on' && this.activity == 'watching_DTT'){
            this.channel = c;
        }
        else{
            console.log("Impossible to change channel");
        }
    }
    openPrimeVideo(){
        if(this.status == 'on' && this.activity == 'watching_DTT'){
            this.activity = 'watching_prime';
        }
    }
    closePrimeVideo(){
        if(this.status == 'on' && this.activity == 'watching_prime'){
            this.activity = 'watching_DTT';
        }
    }
    selectFilm(f){
        if(this.status == 'on' && this.activity == 'watching_prime'){
            this.film = f;
        }
    }
}

class Window extends Observable{
    constructor(house, name){
        super(house,name);
        this.house = house;
        this.name = name;
        this.set('status', 'closed');
    }
    open(){
        if(this.status == 'closed'){
            this.status = 'opened';
        }
    }
    close(){
        if(this.status == 'opened'){
            this.status = 'closed';
        }
    }
}

class Shutter extends Observable{
    constructor(house, name){
        super(house,name);
        this.house = house;
        this.name = name;
        this.set('status', 'down');
    }
    lower(){
        if(this.status == 'half' || this.status == 'up'){
            this.status = 'down';
        }
    }
    raise(){
        if(this.status == 'down' || this.status == 'half'){
            this.status = 'up';
        }
    }
    setHalfway(){
        if(this.status == 'down' || this.status == 'up'){
            this.status = 'half';
        }
    }
}

class VacuumCleaner extends Agent{
    constructor(house, name, in_room){
        super(house,name);
        this.house = house;
        this.name = name;
        this.in_room = in_room
        this.status = "off"
        this.battery = "fully_charged"
    }

    turnOn(){
        if((this.status == 'off' || this.battery == 'charging') && (this.battery == 'fully_charged' || this.battery == 'half_charged')){
            this.status = 'on'
        }
    }

    turnOff(){
        if(this.status == 'on'){
            this.status = 'off'
        }
    }

    move(to){
        console.log("Move from " + this.in_room + " to " + to)
        this.in_room = to
    }

    clean(room){
        console.log("Cleaning ", room)
    }
}

class DoorLock extends Observable{
    constructor(house, name){
        super(house,name);
        this.house = house;
        this.name = name;
        this.set('status', 'door_locked');
    }

    lockDoor(){
        if(this.status == 'door_not_locked'){
            this.status = 'door_locked'
        }
    }

    unlockDoor(){
        if(this.status == 'door_locked'){
            this.status = 'door_not_locked'
        }
    }
}

module.exports = {
    Light : Light,
    Fridge : Fridge,
    DishWasher: DishWasher,
    SoftLight: SoftLight,
    Television: Television,
    Window: Window,
    Shutter:Shutter,
    VacuumCleaner: VacuumCleaner,
    DoorLock: DoorLock
}