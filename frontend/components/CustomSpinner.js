import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const CustomSpinner = ({ size = "large", color = "#FBAF8B" }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default CustomSpinner;
