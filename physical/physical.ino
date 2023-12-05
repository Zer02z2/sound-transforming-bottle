#include <ArduinoBLE.h>
#include <Arduino_LSM6DS3.h>

// const int ledPin = 2; // set ledPin to on-board LED
int count = 0;
// const int buttonPin = 4; // set buttonPin to digital pin 4

BLEService ledService("19B10010-E8F2-537E-4F6C-D104768A1214"); // create service

// create switch characteristic and allow remote device to read and write
// BLEByteCharacteristic ledCharacteristic("19B10011-E8F2-537E-4F6C-D104768A1214", BLERead | BLEWrite);
BLEByteCharacteristic gyroXCharacteristic("19B10011-E8F2-537E-4F6C-D104768A1214", BLERead | BLEWrite);
BLEByteCharacteristic gyroYCharacteristic("19B10011-E8F2-537E-4F6C-D104768A1214", BLERead | BLEWrite);
BLEByteCharacteristic gyroZCharacteristic("19B10011-E8F2-537E-4F6C-D104768A1214", BLERead | BLEWrite);
// create button characteristic and allow remote device to get notifications
// BLEByteCharacteristic buttonCharacteristic("19B10012-E8F2-537E-4F6C-D104768A1214", BLERead | BLENotify);

void setup() {
  Serial.begin(9600);
  // while (!Serial);

  // pinMode(ledPin, OUTPUT); // use the LED as an output
  // pinMode(buttonPin, INPUT); // use button pin as an input
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");

    while (1);
  }

  // begin initialization
  if (!BLE.begin()) {
    Serial.println("starting Bluetooth® Low Energy module failed!");

    while (1);
  }

  // set the local name peripheral advertises
  BLE.setLocalName("ButtonLED");
  // set the UUID for the service this peripheral advertises:
  BLE.setAdvertisedService(ledService);

  // add the characteristics to the service
  // ledService.addCharacteristic(ledCharacteristic);
  ledService.addCharacteristic(gyroXCharacteristic);
  ledService.addCharacteristic(gyroYCharacteristic);
  ledService.addCharacteristic(gyroZCharacteristic);

  // add the service
  BLE.addService(ledService);

  gyroXCharacteristic.writeValue(0);
  gyroYCharacteristic.writeValue(0);
  gyroZCharacteristic.writeValue(0);
  // buttonCharacteristic.writeValue(0);

  // start advertising
  BLE.advertise();

  Serial.println("Bluetooth® device active, waiting for connections...");
}

void loop() {

  int x, y, z;
  if (IMU.accelerationAvailable()) {

    float xf, yf, zf;

    IMU.readAcceleration(xf, yf, zf);

    x = round((256 * xf + 256) / 2);
    y = round((256 * yf + 256) / 2);
    z = round((256 * zf + 256) / 2);
    
  }

  BLEDevice central = BLE.central();

  if (central) {

    Serial.print("Connected to central: ");
    Serial.println(central.address());

    //while (central.connected()) {

      gyroXCharacteristic.writeValue(x);
      gyroYCharacteristic.writeValue(y);
      gyroZCharacteristic.writeValue(z);
      
      // Serial.println(x);
    //}
  }
}
