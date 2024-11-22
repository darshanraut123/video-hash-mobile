import DeviceInfo from 'react-native-device-info';

// Function to fetch all device information
export const fetchDeviceInfo = async () => {
  try {
    return {
        
      uniqueId: await DeviceInfo.getUniqueId(),
      type: DeviceInfo.getType(),
      deviceType: DeviceInfo.getDeviceType(),
      brand: DeviceInfo.getBrand(),
      model: DeviceInfo.getModel(),
      deviceId: DeviceInfo.getDeviceId(),
      systemName: DeviceInfo.getSystemName(),
      systemVersion: DeviceInfo.getSystemVersion(),
      apiLevel: await DeviceInfo.getApiLevel(),
      buildId: await DeviceInfo.getBuildId(),
      bundleId: DeviceInfo.getBundleId(),
      applicationName: DeviceInfo.getApplicationName(),
      buildNumber: DeviceInfo.getBuildNumber(),
      version: DeviceInfo.getVersion(),
      readableVersion: DeviceInfo.getReadableVersion(),
      deviceName: await DeviceInfo.getDeviceName(),
      usedMemory: await DeviceInfo.getUsedMemory(),
      userAgent: await DeviceInfo.getUserAgent(),
      fontScale: await DeviceInfo.getFontScale(),
      bootloader: await DeviceInfo.getBootloader(),
      product: await DeviceInfo.getProduct(),
      installReferrer: await DeviceInfo.getInstallReferrer(),
      installerPackageName: await DeviceInfo.getInstallerPackageName(),
      device: await DeviceInfo.getDevice(),
      display: await DeviceInfo.getDisplay(),
      hardware: await DeviceInfo.getHardware(),
      host: await DeviceInfo.getHost(),
      ipAddress: await DeviceInfo.getIpAddress(),
      macAddress: await DeviceInfo.getMacAddress(),
      manufacturer: await DeviceInfo.getManufacturer(),
      maxMemory: await DeviceInfo.getMaxMemory(),
      totalMemory: await DeviceInfo.getTotalMemory(),
      firstInstallTime: await DeviceInfo.getFirstInstallTime(),
      lastUpdateTime: await DeviceInfo.getLastUpdateTime(),
      carrier: await DeviceInfo.getCarrier(),
      totalDiskCapacity: await DeviceInfo.getTotalDiskCapacity(),
      freeDiskStorage: await DeviceInfo.getFreeDiskStorage(),
      batteryLevel: await DeviceInfo.getBatteryLevel(),
      powerState: await DeviceInfo.getPowerState(),
      isBatteryCharging: await DeviceInfo.isBatteryCharging(),
      isEmulator: await DeviceInfo.isEmulator(),
      isTablet: DeviceInfo.isTablet(),
      hasNotch: DeviceInfo.hasNotch(),
      isPinOrFingerprintSet: await DeviceInfo.isPinOrFingerprintSet(),
      isLocationEnabled: await DeviceInfo.isLocationEnabled(),
      baseOs: await DeviceInfo.getBaseOs(),
      previewSdkInt: await DeviceInfo.getPreviewSdkInt(),
      securityPatch: await DeviceInfo.getSecurityPatch(),
      codename: await DeviceInfo.getCodename(),
      incremental: await DeviceInfo.getIncremental(),
    };
  } catch (error) {
    console.error('Error fetching device info:', error);
    return null;
  }
};

// Usage Example
fetchDeviceInfo().then(info => console.log('Device Info:', info));
