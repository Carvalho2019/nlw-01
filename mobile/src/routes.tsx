import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";

import Home from "./pages/home";
import Points from "./pages/points";
import Detail from "./pages/detail";


const AppStact = createStackNavigator();

const Routes =() => {
    return (
        <NavigationContainer>
            <AppStact.Navigator 
            headerMode="none"
            screenOptions={{
                cardStyle:{
                    backgroundColor: '#f0f0f5'
                }
            }}
            >
                <AppStact.Screen name="Home" component={Home}/>
                <AppStact.Screen name="Points" component={Points}/>
                <AppStact.Screen name="Detail" component={Detail}/>
            </AppStact.Navigator>
        </NavigationContainer>
    );
}

export default Routes;