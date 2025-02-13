//MedicineNavigator.js


import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MedicineScreen from "../screens/MedicineScreens/MedicineScreen";


const Stack = createStackNavigator();

export default function MedicineNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MedicineMain" component={MedicineScreen} />
      
      
    </Stack.Navigator>
  );
}
