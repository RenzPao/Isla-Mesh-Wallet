/**
 * WEB BLE SHIM
 * Web browsers have limited BLE support (no peripheral mode, different Central API).
 * This shim prevents the web build from crashing by providing no-op implementations.
 */

export const startBroadcastingXDR = async (xdr: string) => {
  console.warn("BLE: Broadcasting is not supported on Web. Use the mobile app for Mesh features.");
  return;
};

export const stopBroadcasting = async () => {
  return;
};

export const startScanningForPayments = (onXDRReceived: (xdr: string) => void) => {
  console.warn("BLE: Scanning is not supported in this web demo. Use the mobile app.");
  return;
};

export const stopScanning = () => {
  return;
};

export const bleManager = {
  destroy: () => {}
};
