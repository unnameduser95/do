import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, Dimensions } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import Modal from 'react-native-modal';
import Swipeable from 'react-native-swipeable';

import { getData, setData } from '../components/Sync';
import { SwipeableIcon, TodoModal, MoveModal } from '../components/SharedUI';
// import { ListItem } from './Lists';

const screenWidth = Dimensions.get("screen").width;

const Todo = ({ title, complete, onComplete, onTapText }) => {  // todo object (what shows up in FlatList)

  return (
    <View style={styles.todo}>
      <TouchableOpacity style={styles.checkbox} onPress={onComplete} activeOpacity={1}>
        <Ionicons name={complete ? "ios-checkmark-circle" : "ios-radio-button-off"} size={30} color="#b0b0b0"/>
      </TouchableOpacity>
      <TouchableOpacity style={styles.todoButton} onPress={onTapText}>
        <Text 
          style={[styles.todoTitle, complete ? {textDecorationLine: "line-through", color: "#b0b0b0"} : {color: "black"}]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </TouchableOpacity>
      {/* <TextInput style={styles.todoInput} value={title} onChangeText={(text) => onChangeText(id, text)} /> */}
    </View>
  )
}

const ErrorModal = ({ message, onDismiss }) => {
  return (
    <View style={[styles.modalContainer, {alignItems: "center", justifyContent: "space-evenly"}]}>
      <Text>{message}</Text>
      <TouchableOpacity style={[styles.actionButton]} onPress={onDismiss}>
        <Text style={{ color: "rgba(0, 122, 255, 1)" }}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  )
}

const EmptyTodoPage = ({ error }) => {
  const text = error ? 
    <Text style={styles.placeholderText} allowFontScaling={false}>An error occurred while loading your to-dos. Please try again later.</Text>
  :
    <Text style={styles.placeholderText} allowFontScaling={false}>Tap the button above to create a new to-do!</Text>

  return text;
}

export default function List({ route }) {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
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

  const _getIncompleteTodos = (todos) => {
    const newListTodos = todos.filter((element) => !element.complete)

    console.log("Incomplete to-dos:", newListTodos);
    return newListTodos;
  }

  const _getCompletedTodos = (todos) => {
    const newListTodos = todos.filter((element) => element.complete);

    console.log("Completed to-dos:", newListTodos);
    return newListTodos;
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
      date: null,
      timeEnabled: false,
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
          <View style={{ display: "flex", flex: 1}}>
            <FlatList   // list of to-dos
              data={
                showCompleted ? 
                  _getIncompleteTodos(list.todos).concat(_getCompletedTodos(list.todos))  // combine two lists so incomplete tasks appear first
                :
                  _getIncompleteTodos(list.todos)
              }
              renderItem={({ item }) => 
                {
                  return (
                    <Swipeable rightButtons={[
                      <SwipeableIcon iconName="ios-folder" iconSize={25} onPress={() => {
                        setSelectedTodo(item);
                        setMoveTodo(true);
                      } } />,
                      <SwipeableIcon iconName="ios-trash" backgroundColor="red" iconSize={25} onPress={() => {
                        const newListTodos = _onDeleteTodo(item);
                        _updateList("todos", newListTodos);
                      } } />
                    ]}>
                      <Todo title={item.title} id={item.id} description={item.description} complete={item.complete} onTapText={() => {
                        setEditTodo(true);
                        setSelectedTodo(item);
                      } } onComplete={() => {
                        const newListTodos = _updateTodo({ ...item, complete: !item.complete });
                        _updateList("todos", newListTodos);
                      } } />
                    </Swipeable>
                  );
                }
              }
              keyExtractor={item => item.id}
              style={styles.listContainer}
            />
            <TouchableOpacity 
              style={[styles.actionButton, { width: screenWidth }]}
              onPress={() => setShowCompleted(!showCompleted)}
            >
              <Text style={{ color: "rgba(0, 122, 255, 1)" }}>{showCompleted ? "Hide completed" : "Show completed"}</Text>
            </TouchableOpacity>
          </View>
        :
          loading ?
            <ActivityIndicator size={30} color="#b0b0b0" />
          :
            <EmptyTodoPage error={false} />
      :
        loading ? 
          <ActivityIndicator size={30} color="#b0b0b0" />
        :
          // <Text style={styles.placeholderText} allowFontScaling={false}>An error occurred while loading your to-dos. Please try again later.</Text>
          <EmptyTodoPage error={true} />
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
            onComplete={() => {
              setEditTodo(false);
              Keyboard.dismiss();
            }}
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
            onDismiss={() => {
              setEditTodo(false);
              Keyboard.dismiss();
            }} 
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
            onDismiss={() => {
              setMoveTodo(false);
              Keyboard.dismiss();
            }}
            onMove={(id) => {
              _onMove(selectedTodo, id);
            }}
          />
        :
          <ErrorModal 
            message="An error occurred while loading your to-do. Please try again later." 
            onDismiss={() => {
              setEditTodo(false);
              Keyboard.dismiss();
            }} 
          />
        }
      </Modal>
    </SafeAreaView>
  )
}

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
    flex: 1
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
  },
  actionButton: {
    height: 40,
    width: 75,
    justifyContent: "center",
    alignItems: "center",
    // marginHorizontal: 10,
  },
})