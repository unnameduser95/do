import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import Modal from 'react-native-modal';
import Swipeable from 'react-native-swipeable';

import { getData, setData } from '../components/Sync';
import { SwipeableIcon } from '../components/SharedUI';
import { ListItem } from './Lists';

const Todo = ({ title, id, complete, onComplete, onTapText }) => {  // todo object (what shows up in FlatList)

  return (
    <View style={styles.todo}>
      <TouchableOpacity style={styles.checkbox} onPress={onComplete} activeOpacity={1}>
        <Ionicons name={complete ? "ios-checkmark-circle" : "ios-radio-button-off"} size={30} color="#b0b0b0"/>
      </TouchableOpacity>
      <TouchableOpacity style={styles.todoButton} onPress={onTapText}>
        <Text 
          style={styles.todoTitle}
          numberOfLines={1}
        >
          {title}
        </Text>
      </TouchableOpacity>
      {/* <TextInput style={styles.todoInput} value={title} onChangeText={(text) => onChangeText(id, text)} /> */}
    </View>
  )
}

const TodoModal = ({ todo, onSave, onComplete, onCancel }) => { 
  // onSave: pass new to-do to callback
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [complete, setComplete] = useState(todo.complete);

  return (
    <View style={styles.modalContainer}>
      <View style={todoStyles.titleBar}>
        <TouchableOpacity 
          style={todoStyles.checkbox}
          onPress={() => setComplete(!complete)}  
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
      <View style={todoStyles.reminderBar}>
        <Text>This is where the reminder stuff will go</Text>
      </View>
      <View style={todoStyles.bottom}>
        <TouchableOpacity
          style={todoStyles.actionButton}
          onPress={() => {
            if (title === "" && description === "") {
              onCancel();
            }
            onComplete();
          }}
        >
          <Text style={todoStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[todoStyles.actionButton, todoStyles.saveButton]}
          onPress={() => {
            onSave({
              "title": title,
              "description": description,
              "complete": complete,
              "id": todo.id,
            });  // pass "new" to-do item up
            onComplete();  // hide modal
          }}  
        >
          <Text style={todoStyles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

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
    <View style={[styles.modalContainer, {height: 400}]}>
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
          style={todoStyles.actionButton}
          onPress={onDismiss}
        >
            <Text style={todoStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const ErrorModal = ({ message, onDismiss }) => {
  return (
    <View style={[styles.modalContainer, {alignItems: "center", justifyContent: "space-evenly"}]}>
      <Text>{message}</Text>
      <TouchableOpacity style={[todoStyles.actionButton]} onPress={onDismiss}>
        <Text style={todoStyles.cancelButtonText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function List({ route }) {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editTodo, setEditTodo] = useState(false);  // determine if modal appears or not
  const [moveTodo, setMoveTodo] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);  // determine which todo gets shown in edit/move modal

  const _getList = async (id) => {  // id: integer or string
    try {
      const response = await getData("list-".concat(typeof id === "string" ? id : toString(id)));
      const parsedResponse = JSON.parse(response);  // i spent an hour debugging this and forgot to parse...fml

      setList(parsedResponse);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  }

  const _updateList = (property, newValue) => {
    let newList;

    console.log("Updating list property", property, "with new value", newValue);

    switch(property) {
      case "title": 
        newList = { ...list, title: newValue };
        break;
      case "description": 
        newList = { ...list, description: newValue };
        break;
      case "todos": 
        newList = { ...list, todos: newValue };
        break;
      default: 
        newList = { ...list };
        break;
    }

    console.log("New list:", newList);

    setList(newList);
    setData("list-".concat(list.id), newList);
  }

  // returns updated todo list for use in _updateList
  const _updateTodo = (newTodo) => {

    console.log("Creating updated to-do list with value", newTodo);

    const newListTodos = list.todos.map((item) => {
      let updatedItem = item;

      if (item.id === newTodo.id) {  // must know which todo to replace
        updatedItem = newTodo;
      };

      return updatedItem;
    });

    return newListTodos;
  }

  const _onDeleteTodo = (todo) => {  // returns updated to-do list without deleted to-do
    console.log("Creating updated to-do list with deleted value", todo);

    let newListTodos = list.todos;
    console.log("Current list of todos", newListTodos);
    const index = newListTodos.indexOf(todo);

    if (index > -1) {
      newListTodos.splice(index, 1)
    }

    console.log("Created updated to-do list", newListTodos);

    return newListTodos;
  }

  const _onCreateTodo = () => {
    let newListTodos = list.todos;
    
    // id generation
    // currently doesn't check for duplicate ids, will implement "later"
    const id = Math.round(Math.random() * 100000000);

    const newTodo = {
      title: "",
      description: "",
      complete: false,
      id: id.toString(),
    }

    newListTodos.push(newTodo);

    setList({ ...list, todos: newListTodos });  // WHY IS THE ... ACTUALLY PART OF THE SYNTAX WTF

    // i really, really hope this works
    // UPDATE: IT WORKED LET'S GOOOOOOOOOO
    setData("list-".concat(list.id), {...list, todos: newListTodos});  // uses new component

    setSelectedTodo(newTodo);  // make modal pop up when button is pressed
    setEditTodo(true);
  }

  const _onMove = async (todo, id) => {
    try {
      const newListTodos = _onDeleteTodo(todo);
      // console.log("newListTodos", newListTodos);
      _updateList("todos", newListTodos);

      console.log("id", id);
      const otherList = await getData("list-".concat(id));
      // console.log("listOtherTodos", listOtherTodos);
      let parsedOtherListTodos = JSON.parse(otherList);
      parsedOtherListTodos.todos.push(todo);

      setData("list-".concat(id), parsedOtherListTodos);
    } catch(e) {
      console.error(e);
    }
  }

  useEffect(() => {
    _getList(route.params.list.id);
  }, [])

  // console.log("Current list data in state:", list);
  // console.log("Current list of todos in state:", list ? list.todos : "list object doesn't exist");
  // console.log("Current list title:", list ? list.title : "list object doesn't exist");

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.headerContainer}>
        <TextInput 
          style={styles.heading} 
          allowFontScaling={false}
          onChangeText={(text) => {
            _updateList("title", text);
          }}
        >{list ? list.title : loading ? "" : "No title"}</TextInput>
        <TouchableOpacity onPress={_onCreateTodo}>
          <Ionicons name="ios-add-circle" size={35} color="rgba(0, 122, 255, 1)" />
        </TouchableOpacity>
      </View>
      {list ?  // a ton of conditional stuff for some reason
        list.todos && list.todos.length !== 0 ? 
          
          <FlatList   // replacement for FlatList; moves with keyboard
            data={list.todos}
            renderItem={({ item }) => 
              <Swipeable rightButtons={[
                <SwipeableIcon 
                  iconName="ios-folder" 
                  iconSize={25} 
                  onPress={() => {
                    setSelectedTodo(item);
                    setMoveTodo(true);
                  }}
                />,
                <SwipeableIcon 
                  iconName="ios-trash" 
                  backgroundColor="red" 
                  iconSize={25} 
                  onPress={() => {
                    const newListTodos = _onDeleteTodo(item);
                    _updateList("todos", newListTodos);
                  }}
                />
              ]} >
                <Todo 
                  title={item.title} 
                  id={item.id} 
                  description={item.description} 
                  complete={item.complete} 
                  onTapText={() => {
                    setEditTodo(true);
                    setSelectedTodo(item);
                  }}
                  onComplete={() => {
                    const newListTodos = _updateTodo({ ...item, complete: !item.complete });
                    _updateList("todos", newListTodos);
                  }}  
                />
              </Swipeable>
              }
              keyExtractor={item => item.id}
              style={styles.listContainer}
            />
        :
          loading ?
            <ActivityIndicator size={30} color="#b0b0b0" />
          :
            <Text style={styles.placeholderText} allowFontScaling={false}>Tap the button above to create your first to-do!</Text>
      
      :
        loading ? 
          <ActivityIndicator size={30} color="#b0b0b0" />
        :
          <Text style={styles.placeholderText} allowFontScaling={false}>An error occurred while loading your to-dos. Please try again later.</Text>
      }
      <Modal
        style={styles.modal}
        isVisible={editTodo}
        animationIn="fadeIn"
        animationOut="fadeOut"
        avoidKeyboard
        hideModalContentWhileAnimating
        backdropTransitionOutTiming={0}
      >
        {selectedTodo ? 
          <TodoModal
            todo={selectedTodo}
            onComplete={() => setEditTodo(false)}
            onSave={(todo) => {
              console.log("New todo:", todo);
              const newListTodos = _updateTodo(todo);
              _updateList("todos", newListTodos);  // update data
            }}
            onCancel={() => {
              if (selectedTodo.title === "") {
                const newListTodos = _onDeleteTodo(selectedTodo);
                _updateList("todos", newListTodos);
              }
            }}
          />
        :
          <ErrorModal 
            message="An error occurred while loading your to-do. Please try again later." 
            onDismiss={() => setEditTodo(false)} 
          />
        }
      </Modal>
      <Modal
        style={styles.modal}
        isVisible={moveTodo}
        animationIn="fadeIn"
        animationOut="fadeOut"
        avoidKeyboard
        hideModalContentWhileAnimating
        backdropTransitionOutTiming={0}
      >
        {selectedTodo ? 
          <MoveModal
            currentListId={list.id}
            onDismiss={() => setMoveTodo(false)}
            onMove={(id) => {
              _onMove(selectedTodo, id);
            }}
          />
        :
          <ErrorModal 
            message="An error occurred while loading your to-do. Please try again later." 
            onDismiss={() => setEditTodo(false)} 
          />
        }
      </Modal>
    </SafeAreaView>
  )
}

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
})

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
    height: 120,
    color: "black",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    padding: 10,
    paddingTop: 10,
  },
  reminderBar: {
    alignItems: "center",
    justifyContent: "center",
    height: 55,
    width: 300,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2"
  },
  bottom: {
    width: 300,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  saveButton: {
    backgroundColor: "rgba(0, 122, 255, 1)",
    borderRadius: 5,
  },
  saveButtonText: {
    color: "white",
  },
})

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 90,
    marginHorizontal: 10,
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    flex: 1,
  },
  placeholderText: {
    alignSelf: "center",
    marginTop: 20,
    fontSize: 17,
    fontStyle: "italic",
    color: "#b0b0b0"
  },
  listContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2",
  },
  todo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 55,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2"
  },
  checkbox: {
    margin: 10,
  },
  todoButton: {
    color: "#000000",
    flex: 1,
    height: 55,
    justifyContent: "center",
  },
  todoTitle: {
    fontSize: 17,
  },
  modal: {  // make sure damn thing is centered
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    flexDirection: "column",
    height: 300,
    width: 300,
    borderRadius: 5,
  }
})