export interface WifiStatus {
  connected: boolean | null
  ssid: string | null
  security: string | null
  signalPercent: number | null
  ip: string | null
  mask: string | null
  gateway: string | null
  serverConnected: boolean | null
}

export interface ServiceCounters {
  hoursAtPower100: number | null
  hoursAtPower50: number | null
  hoursAtPower30: number | null
  ignitions: number | null
  feederHours: number | null
}

export interface BoilerStatus {
  boilerTemperature: number | null
  boilerTargetTemperature: number | null
  feederTemperature: number | null
  outdoorTemperature: number | null
  flueGasTemperature: number | null
  hotWaterTemperature: number | null
  hotWaterTargetTemperature: number | null
  upperBufferTemperature: number | null
  lowerBufferTemperature: number | null
  fuelLevel: number | null
  boilerThermostat: boolean | null
  oxygenPercent: number | null
  boilerPump: boolean | null
  blower: boolean | null
  feeder: boolean | null
  igniter: boolean | null
  hotWaterPump: boolean | null
  additionalFeeder: boolean | null
  boilerPowerPercent: number | null
  wifi: WifiStatus | null
  serviceCounters: ServiceCounters | null
}

export type ActuatorState = 'STOP' | 'OPENING' | 'CLOSING' | string

export interface MixerStatus {
  id: number
  temperature: number | null
  targetTemperature: number | null
  roomThermostat: boolean | null
  pump: boolean | null
  valvePercent: number | null
  actuator: ActuatorState | null
}
