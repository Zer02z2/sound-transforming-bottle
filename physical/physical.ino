#include <ArduinoBLE.h>
#include <Arduino_LSM6DS3.h>

long previousMillis = 0;
String lastNoti = "";

BLEService gyroService("e5cfc525-435a-4458-8940-3e4f267d468f");  // create service

// create switch characteristic and allow remote device to read and write
BLEStringCharacteristic gyroCharacteristic("e5cfc525-435a-4458-8940-3e4f267d468f", BLERead | BLENotify, 20);

void setup() {
  Serial.begin(9600);
  //while (!Serial);
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

  float x, y, z;
  if (IMU.accelerationAvailable()) {

    IMU.readAcceleration(x, y, z);

    String notification = String(x);
    if (lastNoti != notification) {

      gyroCharacteristic.writeValue(notification);
      lastNoti = notification;

    }
  }
}
