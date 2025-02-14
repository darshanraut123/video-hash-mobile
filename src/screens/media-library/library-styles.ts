import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 20,
  },
  tabContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabs: {
    width: '48%',
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  tabsTxt: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 3,
  },
  videoPlayerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  fullScreenVideo: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 25,
    zIndex: 1,
  },
  shareBtn: {left: 25},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  icon: {
    width: 50,
    height: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#36454F',
    borderRadius: 25,
  },

  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tableValue: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    paddingLeft: 10,
  },
  subheading: {
    fontSize: 20,
    color: '#474747',
    fontFamily: "Lato-Bold",
    paddingBottom: 20
  },
});

export default styles;