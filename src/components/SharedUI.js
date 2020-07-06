import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
  View,
  TextInput,
  Text,
  FlatList,
  Platform,
 } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { getData, setData } from './Sync';

const screenWidth = Dimensions.get("screen").width;

const ListItem = ({ title, num, onPress, isDisabled }) => {  // num: number of tasks in list
  return (
    <TouchableOpacity 
      style={listItemStyles.listItem}  
      onPress={onPress}
      disabled={isDisabled ? isDisabled : false}
    >
      <View style={listItemStyles.listContent}>
        <Text style={[listItemStyles.listText, { color: isDisabled ? "#b0b0b0" : "#000000" }]}>{title}</Text>
        <View style={listItemStyles.listEnd}>
          <Text style={listItemStyles.listNum}>{num}</Text>
          <Ionicons name={"ios-arrow-forward"} size={16} color="#b0b0b0" />
        </View>
      </View>
    </TouchableOpacity>
  )
};

const listItemStyles = StyleSheet.create({
  listItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 55,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2"
  },
  listContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 10,
  },
  listEnd: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  listText: {
    fontSize: 17,
  },
  listNum: {
    marginRight: 5,
    fontSize: 17,
    color: "#b0b0b0"
  },
})

const MoveModal = ({ currentListId, onDismiss, onMove }) => {
  const [lists, setLists] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const _refresh = async () => {
    const _loadFromStorage = async (id) => {
      const response = await getData("list-".concat(id));

      return JSON.parse(response);
    }

    try {
      const listIDs = await getData("lists");
      const parsedListIDs = JSON.parse(listIDs);
      const lists = await Promise.all(parsedListIDs.map(async (element) => {
        return await _loadFromStorage(typeof element === "object" ? element.id : element);
      }));

      setLists(lists);
      setLoading(false);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    _refresh();
  }, [])

  return (
    <View style={[modalStyles.container, {height: 400}]}>
      <View style={moveStyles.headerBar}>
        <Text style={moveStyles.header}>Move to...</Text>
      </View>
      {lists ? 
        <FlatList 
          data={lists}
          renderItem={({ item }) => <ListItem 
            title={item.title} 
            onPress={() => {
              onMove(item.id);
              onDismiss();
            }}
            isDisabled={ currentListId === item.id }
          />}
          keyExtractor={item => item.id}
        />
      : loading ?
          <Text>Loading...</Text>
        :
          <Text>There was an error loading your lists. Please try again later.</Text>
      }
      <View style={moveStyles.bottom}>
        <TouchableOpacity
          style={modalStyles.actionButton}
          onPress={onDismiss}
        >
          <Text style={modalStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
};

const moveStyles = StyleSheet.create({
  headerBar: {
    justifyContent: "center",
    alignItems: "center",
    height: 45,
  },
  header: {
    fontSize: 18,
    fontWeight: "500",
  },
  listItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 55,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2"
  },
  bottom: {
    width: 300,
    height: 80,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  }
});

const DateTimePickerButton = ({ onPress, onIconPress, width, height, display, icon }) => {
  return (
    <TouchableOpacity onPress={onPress} style={{ 
      width: width ? width : 135,
      height: height ? height : 40, 
      margin: 5,
      padding: 5,
      backgroundColor: "#f0f0f0",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    }}
    >
      <Text>
        {display ? display : "None"}
      </Text>
      <TouchableOpacity 
        onPress={onIconPress}
        activeOpacity={1}  
      >
        <Ionicons name={icon ? icon : "ios-calendar"} size={25} color="#b0b0b0" />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

const TodoModal = ({ todo, onSave, onComplete, onCancel }) => { 
  // onSave: pass new to-do to callback
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [date, setDate] = useState(todo.date);  // will be passed down to DateTimePickerButton
  const [timeEnabled, setTimeEnabled] = useState(todo.timeEnabled);
  const [complete, setComplete] = useState(todo.complete);

  // DateTimePicker
  const [show, setShow] = useState(false);  // show/hide DateTimePicker
  const [mode, setMode] = useState('date');  // will be passed to DateTimePicker

  const _onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');  // hide if on Android
    setDate(currentDate);
    // console.log(currentDate);
  }

  return (
    <View style={show && Platform.OS === 'ios' ? [modalStyles.container, { height: 400 }] : modalStyles.container}>
      <View style={todoStyles.titleBar}>
        <TouchableOpacity 
          style={todoStyles.checkbox}
          onPress={() => setComplete(!complete)}
          activeOpacity={1}
        >
          <Ionicons name={complete ? "ios-checkmark-circle" : "ios-radio-button-off"} size={30} color="#b0b0b0"/>
        </TouchableOpacity>
        <TextInput
          style={todoStyles.title} 
          value={title} 
          onChangeText={(text) => setTitle(text)} 
          autoFocus={true}  
        />
      </View>
      <TextInput 
        style={todoStyles.description} 
        value={description} 
        placeholder="Description" 
        placeholderTextColor="#b0b0b0"
        multiline={true}
        onChangeText={(text) => setDescription(text)}
      />
      <View style={show && Platform.OS === 'ios' ? [todoStyles.reminderBar, { height: 200 }] : todoStyles.reminderBar}>
        <View style={todoStyles.reminderButtons}>
          <DateTimePickerButton 
            display={date ? (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() : "Date"} 
            icon={date ? "ios-close-circle" : "ios-calendar"} 
            onPress={() => {
              setDate(new Date())
              setShow(mode === 'date' && show ? false : true);
              setMode('date');
            }}
            onIconPress={
              date ?
                () => {
                  setDate(null);
                  setShow(false);
                }
              :
                () => null
            }
          />
          <DateTimePickerButton 
            display={timeEnabled ? date.getHours() + ":" + date.getMinutes() : "Time"} 
            icon={timeEnabled ? "ios-close-circle" : "ios-time"} 
            onPress={() => {
              setShow(mode === 'time' && show ? false : true);
              setMode('time');
              setTimeEnabled(true);
            }}
            onIconPress={
              timeEnabled ?
                () => {
                  setTimeEnabled(false);
                  setShow(false);
                }
              :
                () => null
            } 
          />
        </View>
        {show && (
          <View style={todoStyles.dateTimePickerView}>
            <DateTimePicker
              value={date ? date : new Date()}
              mode={mode}
              textColor="black"
              style={todoStyles.dateTimePicker}
              onChange={_onChangeDate}
            />
          </View>
        )}
        
      </View>
      <View style={todoStyles.bottom}>
        <TouchableOpacity
          style={modalStyles.actionButton}
          onPress={() => {
            if (title === "" && description === "") {
              onCancel();
            }
            onComplete();
          }}
        >
          <Text style={modalStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[modalStyles.actionButton, modalStyles.confirmButton]}
          onPress={() => {
            onSave({
              "title": title,
              "description": description,
              "complete": complete,
              "id": todo.id,
              "date": date,
              "timeEnabled": timeEnabled
            });  // pass "new" to-do item up
            onComplete();  // hide modal
          }}  
        >
          <Text style={modalStyles.confirmButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
};

const todoStyles = StyleSheet.create({
  titleBar: {
    flexDirection: "row",
    height: 55,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  title: {
    flex: 1,
    color: "black",
    fontSize: 17,
  },
  checkbox: {
    margin: 10,
  },
  description: {
    height: 80,
    color: "black",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    padding: 10,
    paddingTop: 10,
  },
  reminderBar: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: 55,
    width: 300,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2"
  },
  reminderButtons: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 55,
    width: 300,
  },
  dateTimePickerView: {
    height: 135,
    width: 300
  },
  dateTimePicker: {
    height: 135,
  },
  bottom: {
    width: 300,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
})

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

const modalStyles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    flexDirection: "column",
    height: 265,
    width: 300,
    borderRadius: 5,
  },
  actionButton: {
    height: 40,
    width: 75,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  cancelButtonText: {
    color: "rgba(0, 122, 255, 1)",
  },
  confirmButton: {
    backgroundColor: "rgba(0, 122, 255, 1)",
    borderRadius: 5,
  },
  confirmButtonText: {
    color: "white",
  },
})

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

export { ListItem, MoveModal, TodoModal, SwipeableIcon };
