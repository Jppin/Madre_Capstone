import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CameraScreen from "../screens/MedicineScreens/CameraScreen";
import GalleryScreen from "../screens/MedicineScreens/GalleryScreen";
import ManualEntryScreen from "../screens/MedicineScreens/ManualEntryScreen";

const Stack = createStackNavigator();

export default function CameraNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CameraMain" component={CameraScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="ManualEntry" component={ManualEntryScreen} />
    </Stack.Navigator>
  );
}
