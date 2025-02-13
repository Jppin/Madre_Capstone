import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isNewUser, setIsNewUser] = useState(false);

    async function getData() {
        try {
            const token = await AsyncStorage.getItem("token");
            const newUser = await AsyncStorage.getItem("isNewUser");
            if (!token) {
                setUserData(null);
                setIsNewUser(false);
                setLoading(false);
                return;
            }

            const res = await axios.get("http://10.0.2.2:5001/userdata", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserData(res.data.data);
            setIsNewUser(newUser === "true");

            if (res.data.data.isNewUser) {
                setIsNewUser(true);
            }

        } catch (error) {
            setUserData(null);
            setIsNewUser(false);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <AuthContext.Provider value={{ userData, loading, setUserData, getData, isNewUser }}>
            {children}
        </AuthContext.Provider>
    );
};
