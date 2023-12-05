#include <ArduinoBLE.h>
#include <Arduino_LSM6DS3.h>

// const int ledPin = 2; // set ledPin to on-board LED
long previousMillis = 0;
// const int buttonPin = 4; // set buttonPin to digital pin 4

BLEService gyroService("19B10010-E8F2-537E-4F6C-D104768A1214");  // create service

// create switch characteristic and allow remote device to read and write
// BLEByteCharacteristic ledCharacteristic("19B10011-E8F2-537E-4F6C-D104768A1214", BLERead | BLEWrite);
BLEStringCharacteristic gyroCharacteristic("19B10011-E8F2-537E-4F6C-D104768A1214", BLERead | BLENotify, 20);

// create button characteristic and allow remote device to get notifications
// BLEByteCharacteristic buttonCharacteristic("19B10012-E8F2-537E-4F6C-D104768A1214", BLERead | BLENotify);

void setup() {
  Serial.begin(9600);
  while (!Serial);
  Serial.println("starting");

  // pinMode(ledPin, OUTPUT); // use the LED as an output
  // pinMode(buttonPin, INPUT); // use button pin as an input
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");

    while (1)
      ;
  }

  // begin initialization
  if (!BLE.begin()) {
    Serial.println("starting Bluetooth® Low Energy module failed!");

    while (1)
      ;
  }

  // set the local name peripheral advertises
  BLE.setLocalName("GyroCup");
  // set the UUID for the service this peripheral advertises:
  BLE.setAdvertisedService(gyroService);

  // add the characteristics to the service
  // ledService.addCharacteristic(ledCharacteristic);
  gyroService.addCharacteristic(gyroCharacteristic);

  // add the service
  BLE.addService(gyroService);

  gyroCharacteristic.writeValue("0,0,0");

  // buttonCharacteristic.writeValue(0);

  // start advertising
  BLE.advertise();

  Serial.println("Bluetooth® device active, waiting for connections...");
}

void loop() {

  BLEDevice central = BLE.central();

  if (central) {

    Serial.print("Connected to central: ");
    Serial.println(central.address());

    while (central.connected()) {

      long currentMillis = millis();
      if (currentMillis - previousMillis >= 200) {

        previousMillis = currentMillis;
        updateGyroLevel();
      }
    }
  }
}

void updateGyroLevel() {

  float x, y, z;
  if (IMU.accelerationAvailable()) {

    // float xf, yf, zf;

    IMU.readAcceleration(x, y, z);

    // x = round((256 * xf + 256) / 2);
    // y = round((256 * yf + 256) / 2);
    // z = round((256 * zf + 256) / 2);

    String notification = String(x) + "," + String(y) + "," + String(z);
    gyroCharacteristic.writeValue(notification);
    Serial.println(notification);
  }
}
