import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    async function getData() {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                setUserData(null);
                setLoading(false);
                return;
            }

            const res = await axios.get("http://10.0.2.2:5001/userdata", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserData(res.data.data);
        } catch (error) {
            setUserData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getData();
    }, []);

    return (
        <AuthContext.Provider value={{ userData, loading, setUserData, getData }}>
            {children}
        </AuthContext.Provider>
    );
};
