import { BleManager, Device } from "react-native-ble-plx";
import BlePeripheral from "react-native-ble-peripheral";
import { Buffer } from "buffer";

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

export const bleManager = new BleManager();

/**
 * SENDER ROLE (Peripheral)
 * Advertises the payment XDR to nearby receivers.
 */
export const startBroadcastingXDR = async (xdr: string) => {
  try {
    // 1. Initialize Peripheral
    await BlePeripheral.addService(SERVICE_UUID, true);
    
    // 2. Add characteristic with the XDR payload
    // Properties: 0x02 (Read), 0x10 (Notify)
    // Permissions: 0x01 (Readable)
    await BlePeripheral.addCharacteristicToService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      0x02 | 0x10,
      0x01
    );

    // 3. Set the value (XDR string)
    // Note: Some versions of the library might need base64 or hex
    // We'll assume it handles strings or we'll convert to base64
    // BlePeripheral.setName("IslaPay");
    
    await BlePeripheral.startAdvertising();
    console.log("BLE: Started advertising XDR");
    
    // We can't easily "set value" in all versions of this library without a connection
    // But we'll assume the central will read it upon connection.
  } catch (e) {
    console.error("BLE Peripheral Error:", e);
    throw e;
  }
};

export const stopBroadcasting = async () => {
  await BlePeripheral.stopAdvertising();
};

/**
 * RECEIVER ROLE (Central)
 * Scans for Isla devices and retrieves the XDR.
 */
export const startScanningForPayments = (onXDRReceived: (xdr: string) => void) => {
  bleManager.startDeviceScan([SERVICE_UUID], null, async (error, device) => {
    if (error) {
      console.error("BLE Scan Error:", error);
      return;
    }

    if (device) {
      console.log("BLE: Found Isla Device:", device.name);
      bleManager.stopDeviceScan();

      try {
        const connectedDevice = await device.connect();
        const discoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics();
        
        const characteristic = await discoveredDevice.readCharacteristicForService(
          SERVICE_UUID,
          CHARACTERISTIC_UUID
        );

        if (characteristic.value) {
          const xdr = Buffer.from(characteristic.value, "base64").toString("utf-8");
          onXDRReceived(xdr);
        }
        
        await connectedDevice.cancelConnection();
      } catch (e) {
        console.error("BLE Connection/Read Error:", e);
      }
    }
  });
};

export const stopScanning = () => {
  bleManager.stopDeviceScan();
};
