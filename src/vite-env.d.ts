/// <reference types="vite/client" />

declare namespace NodeJS {
    interface Global {
      navigator: Navigator & {
        serial: Serial;
      };
    }
  }
  interface Serial {
    requestPort(filters?: SerialPortFilter[]): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  }
  
  interface SerialPortFilter {
    usbVendorId?: number;
    usbProductId?: number;
    bluetoothServiceClassId?: BluetoothServiceUUID;
  }
  
  type BluetoothServiceUUID = string;
