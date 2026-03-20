export type CrashLog = {
  id: string;
  deviceId: string;
  timestamp: string;
  errorMessage: string;
  stackTrace: string;
  appVersion: string;
};

export const mockCrashLogs: CrashLog[] = [
  {
    id: "CRASH-001",
    deviceId: "86f09d05-c276-40b5-bd29-6187cc507cc5",
    timestamp: "2026-03-12T18:30:25Z",
    errorMessage: "NullPointerException in MainActivity.onCreate()",
    stackTrace: `java.lang.NullPointerException: Attempt to invoke virtual method 'void android.widget.TextView.setText(java.lang.CharSequence)' on a null object reference
    at com.example.app.MainActivity.onCreate(MainActivity.java:45)
    at android.app.Activity.performCreate(Activity.java:7802)
    at android.app.Activity.performCreate(Activity.java:7791)
    at android.app.Instrumentation.callActivityOnCreate(Instrumentation.java:1299)
    at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:3245)`,
    appVersion: "1.2.3",
  },
  {
    id: "CRASH-002",
    deviceId: "86f09d05-c276-40b5-bd29-6187cc507cc5",
    timestamp: "2026-03-12T15:20:18Z",
    errorMessage: "OutOfMemoryError: Failed to allocate bitmap",
    stackTrace: `java.lang.OutOfMemoryError: Failed to allocate a 12345678 byte allocation with 4567890 free bytes and 4MB until OOM
    at dalvik.system.VMRuntime.newNonMovableArray(Native Method)
    at android.graphics.BitmapFactory.nativeDecodeStream(Native Method)
    at android.graphics.BitmapFactory.decodeStreamInternal(BitmapFactory.java:756)
    at android.graphics.BitmapFactory.decodeStream(BitmapFactory.java:732)`,
    appVersion: "1.2.3",
  },
  {
    id: "CRASH-003",
    deviceId: "DEV-10001",
    timestamp: "2026-03-11T22:15:40Z",
    errorMessage: "IllegalStateException: Fragment not attached to Activity",
    stackTrace: `java.lang.IllegalStateException: Fragment DataFragment{abc123} not attached to Activity
    at androidx.fragment.app.Fragment.requireActivity(Fragment.java:899)
    at com.example.app.DataFragment.loadData(DataFragment.java:78)
    at com.example.app.DataFragment$1.run(DataFragment.java:120)
    at android.os.Handler.handleCallback(Handler.java:938)`,
    appVersion: "1.2.2",
  },
];

export function getCrashLogsByDeviceId(deviceId: string): CrashLog[] {
  return mockCrashLogs.filter((crash) => crash.deviceId === deviceId);
}

export function getAllCrashLogs(): CrashLog[] {
  return mockCrashLogs;
}
