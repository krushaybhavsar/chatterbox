import Constants from "expo-constants";
import Permissions from "expo-permissions";

class UserPermissions {
  getCameraPermission = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

      if (status != "granted") {
        alert(
          "Permission to access camera roll must be granted in order to select a picture."
        );
      }
    }
  };
}

export default new UserPermissions();
