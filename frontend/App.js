import React from "react";
import StackNavigator from "./navigation/StackNavigator";
import { AuthProvider } from "./context/AuthContext";
import { NavigationContainer } from "@react-navigation/native";

const App = () => {
    return (
        <AuthProvider>
            <NavigationContainer>
                <StackNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
};

export default App;
