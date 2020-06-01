import React from 'react';
import { StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';

const screenWidth = Dimensions.get("screen").width;

const SwipeableIcon = ({ iconName, iconSize, iconColor, backgroundColor, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.swipeable, {backgroundColor: backgroundColor ? backgroundColor : "rgba(0, 122, 255, 1)"}]}
      activeOpacity={1}
      onPress={onPress}  
    >
      <Ionicons name={iconName} size={iconSize ? iconSize : 35} color={iconColor ? iconColor : "white"} style={styles.swipeableIcon} />
    </TouchableOpacity>
  )

}

const SwipeableDelete = () => {
  return (
    <TouchableOpacity style={[styles.swipeable, {backgroundColor: "red"}]}>
      <Ionicons name="ios-trash" size={35} color={"white"} style={styles.swipeableIcon} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  swipeable: {
    flex: 1,
    justifyContent: "center",
    height: 55,
  },
  swipeableIcon: {
    margin: 10,
  }
})

export { SwipeableIcon };