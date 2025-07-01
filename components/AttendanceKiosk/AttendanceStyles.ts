import { StyleSheet } from "react-native";

const attendanceStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  centered: {
    alignItems: 'center',
    width: '100%',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#8A44AD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    alignSelf: 'center',
  },
  avatarText: { color: "#fff", fontSize: 40, fontWeight: "bold" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: 'center', width: '100%' },
  welcome: { fontSize: 24, fontWeight: "bold", textAlign: 'center', width: '100%', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: 'center', width: '100%' },
  message: { fontSize: 18, textAlign: "center", marginVertical: 10, width: '100%' },
  loader: { marginTop: 10 },
  workedHours: {
    fontSize: 20,
    color: '#1976d2',
    fontWeight: 'bold',
    marginVertical: 6,
    textAlign: 'center',
    width: '100%',
  },
  timer: {
    fontSize: 32,
    color: '#388e3c',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    width: '100%',
  },
  timerLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    width: '100%',
    color: '#388e3c', // verde
  },
  button: {
    borderRadius: 10,
    overflow: 'hidden',
    minWidth: 120,
    marginHorizontal: 4,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    width: "100%",
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "left",
    width: "100%",
  },
});

export default attendanceStyles;