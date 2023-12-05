// The serviceUuid must match the serviceUuid of the device you would like to connect
const serviceUuid = "19B10010-E8F2-537E-4F6C-D104768A1214";
let myCharacteristic;
let myValue = 0
let input;
let myBLE;

function setup() {
    createCanvas(400, 400);
    myBLE = new p5ble();

    // Create a 'Connect' button
    const connectButton = createButton("Connect");
    connectButton.mousePressed(connectToBle);

    // Create a text input
    input = createInput();

    // Create a 'Write' button
    const writeButton = createButton("Write");
    writeButton.mousePressed(writeToBle);
}

function draw() {
    background(200);
    fill(0);
    textSize(50);
    text(myValue, 200, 200);
}

function connectToBle() {
    // Connect to a device by passing the service UUID
    myBLE.connect(serviceUuid, gotCharacteristics);
}

function gotCharacteristics(error, characteristics) {
    if (error) console.log("error: ", error);
    console.log("characteristics: ", characteristics);
    // Set the first characteristic as myCharacteristic
    myCharacteristic = characteristics[0];

    // read the value of the first characteristic
    myBLE.read(myCharacteristic, gotValue);
}

function gotValue(error, value) {

    if (error) console.log("error: ", error);
    console.log("value: ", value);
    myValue = value;
    myBLE.read(myCharacteristic, gotValue);
}

function writeToBle() {
    const inputValue = input.value();
    // Write the value of the input to the myCharacteristic
    myBLE.write(myCharacteristic, inputValue);
}