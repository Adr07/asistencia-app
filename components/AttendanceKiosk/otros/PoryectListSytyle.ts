import { StyleSheet } from "react-native";

export const ProyectListStyles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  projectItem: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedItem: {
    backgroundColor: '#cce5ff',
    borderColor: '#007bff',
    borderWidth: 2,
  },
  projectName: {
    fontSize: 18,
    color: '#222',
  },
  taskList: {
    marginLeft: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  taskItem: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  selectedTask: {
    backgroundColor: '#ffe5b4',
    borderColor: '#ff9800',
    borderWidth: 2,
  },
  taskName: {
    fontSize: 16,
    color: '#444',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
    fontSize: 16,
  },
  emptyTaskText: {
    color: '#888',
    fontSize: 15,
    fontStyle: 'italic',
    marginVertical: 4,
  },
});