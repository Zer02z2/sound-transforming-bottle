#include <ArduinoBLE.h>
#include <Arduino_LSM6DS3.h>
#include <Wire.h>
#include "Adafruit_VL6180X.h"

long previousMillis = 0;
String lastNoti = "";

Adafruit_VL6180X vl = Adafruit_VL6180X();

BLEService gyroService("e5cfc525-435a-4458-8940-3e4f267d468f");  // create service

// create switch characteristic and allow remote device to read and write
BLEStringCharacteristic gyroCharacteristic("e5cfc525-435a-4458-8940-3e4f267d468f", BLERead | BLENotify, 20);

void setup() {
  Serial.begin(115200);
  //while (!Serial);
  Serial.println("starting");

  // pinMode(ledPin, OUTPUT); // use the LED as an output
  // pinMode(buttonPin, INPUT); // use button pin as an input
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");

    while (1)
      ;
  }

  if (!vl.begin()) {
    Serial.println("Failed to find sensor");
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

  gyroCharacteristic.writeValue("0");

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

  float lux = vl.readLux(VL6180X_ALS_GAIN_5);
  float distance;

  uint8_t range = vl.readRange();
  uint8_t status = vl.readRangeStatus();

  if (status == VL6180X_ERROR_NONE) {
    distance = range;
  } else {
    distance = 10000.0;
  }
  Serial.println(distance);

  float x, y, z;
  if (IMU.accelerationAvailable()) {

    IMU.readAcceleration(x, y, z);

    String notification = String(x) + ',' + String(lux);
    if (lastNoti != notification) {

      gyroCharacteristic.writeValue(notification);
      lastNoti = notification;
    }
  }

  delay(50);
}
